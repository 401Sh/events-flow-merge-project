import {
  Injectable,
  Logger,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import * as argon2 from 'argon2';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ParticipantEntity } from './entities/participant.entity';
import { EventsService } from 'src/events/events.service';
import { EventParticipationApprove } from 'src/events/enums/event-participation-approve.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ParticipantEntity)
    private participantRepository: Repository<ParticipantEntity>,

    private readonly eventsService: EventsService,
  ) {}

  async create(
    email: string,
    password: string,
    emailConfirmationCode: string,
    emailConfirmationCodeExpiresAt: Date,
  ): Promise<UserEntity> {
    const isAvailable = await this.isEmailAvailable(email);
    if (!isAvailable) {
      this.logger.log(`Cannot create user. Email ${email} is already used`);
      throw new ConflictException(`Email ${email} is already used`);
    }

    const hashedPassword = await this.hashData(password);

    const user = await this.userRepository.save({
      email,
      password: hashedPassword,
      emailConfirmationCode,
      emailConfirmationCodeExpiresAt,
    });

    this.logger.log(`Created user with email: ${email}`);
    this.logger.debug('Created user', user);
    return user;
  }


  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository
      .createQueryBuilder('users')
      .where('users.email = :email', { email })
      .getOne();

    this.logger.log(`Finded user with email: ${email}`);
    return user;
  }


  async findById(id: number): Promise<UserEntity> {
    const user = await this.userRepository
      .createQueryBuilder('users')
      .where('users.id = :id', { id })
      .select(['users.login', 'users.id'])
      .getOne();

    if (!user) {
      this.logger.log(`No user with id: ${id}`);
      throw new BadRequestException('User does not exist');
    }

    this.logger.log(`Finded user with id: ${id}`);
    return user;
  }


  async update(userId: number, user: UserEntity) {
    const updateResult = await this.userRepository.update({ id: userId }, user);

    if (updateResult.affected === 0) {
      this.logger.debug(`Cannot update user with id: ${userId}`);
      throw new NotFoundException('User not found');
    }

    return updateResult;
  }


  async subscribeToEvent(userId: number, eventId: number) {
    const existingParticipant = await this.participantRepository.findOne({
      where: {
        user: { id: userId },
        event: { id: eventId },
      },
      relations: ['user', 'event'],
    });

    if (existingParticipant) {
      throw new BadRequestException('User is already subscribed to this event');
    }

    const [event, user] = await Promise.all([
      this.eventsService.findPublishedById(eventId),
      this.findById(userId),
    ]);

    const participant = new ParticipantEntity();
    participant.event = event;
    participant.user = user;

    if (event.approveType == EventParticipationApprove.OPEN) {
      participant.isApproved = true;
    }

    const savedParticipant = await this.participantRepository.save(participant);

    return savedParticipant;
  }


  async unsubscribeToEvent(userId: number, eventId: number) {
    const participant = await this.participantRepository.findOne({
      where: {
        user: { id: userId },
        event: { id: eventId },
      },
      relations: ['user', 'event'],
    });

    if (!participant) {
      throw new BadRequestException('Subscription not found');
    }

    const deleteResult = await this.participantRepository.delete(participant.id);

    return deleteResult;
  }


  async getUserEventHistory(userId: number, isCompleted: boolean) {
    const now = new Date();

    const queryBuilder = this.participantRepository.createQueryBuilder('participant');

    queryBuilder.leftJoinAndSelect('participant.event', 'event');

    if (isCompleted) {
      queryBuilder.andWhere('event.startsAt <= :now', { now });
    } else {
      queryBuilder.andWhere('event.startsAt > :now', { now });
    }

    queryBuilder.where('participant.userId = :userId', { userId })
    
    const participants = await queryBuilder.getMany();

    return participants;
  }


  private async isEmailAvailable(email: string): Promise<boolean> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    return !existingUser;
  }


  private hashData(data: string): Promise<string> {
    return argon2.hash(data);
  }


  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDeleteExpiredAccounts() {
    const now = new Date();

    const expiredUsers = await this.userRepository.find({
      where: {
        isEmailConfirmed: false,
        emailConfirmationCodeExpiresAt: LessThan(now),
      },
    });

    if (expiredUsers.length) {
      this.logger.log(`Removing ${expiredUsers.length} unconfirmed users`);
      await this.userRepository.remove(expiredUsers);
    } else {
      this.logger.log('No unconfirmed users');
    }
  }
}