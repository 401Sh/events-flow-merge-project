import { Injectable, Logger, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "./entities/user.entity";
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(email: string, password: string): Promise<UserEntity> {
    const isAvailable = await this.isEmailAvailable(email);
    if (!isAvailable) {
      this.logger.log(`Cannot create user. Email ${email} is already used`);
      throw new ConflictException(`Email ${email} is already used`);
    };

    const hashedPassword = await this.hashData(password);

    const user = await this.userRepository.save({
      email: email,
      password: hashedPassword,
    });

    this.logger.log(`Created user with email: `, email);
    this.logger.debug('Created user', user);
    return user;
  }


  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository
      .createQueryBuilder('users')
      .where('users.email = :email', { email })
      .select([
        'users.id',
        'users.email',
        'users.password',
      ])
      .getOne();

    this.logger.log(`Finded user with email: ${email}`);
    return user;
  }


  async findById(id: number): Promise<UserEntity | null> {
    const user = await this.userRepository
      .createQueryBuilder('users')
      .where('users.id = :id', { id })
      .select(['users.login', 'users.id'])
      .getOne();

    this.logger.log(`Finded user with id: ${id}`);
    return user;
  }


  private async isEmailAvailable(email: string): Promise<boolean> {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    return !existingUser;
  }


  private hashData(data: string): Promise<string> {
    return argon2.hash(data);
  }
}