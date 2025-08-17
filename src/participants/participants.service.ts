import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventParticipationApprove } from 'src/events/enums/event-participation-approve.enum';
import { EventsService } from 'src/events/events.service';
import { ParticipantEntity } from 'src/participants/entities/participant.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(ParticipantEntity)
    private participantRepository: Repository<ParticipantEntity>,

    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
  ) {}

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
      this.usersService.findById(userId),
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
}