import { Injectable, Logger } from '@nestjs/common';
import { AbstractLeaderUserRepository } from './repositories/abstract-leader-user.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly leaderRepository: AbstractLeaderUserRepository,
  ) {}

  async getLeaderUser(userId: number, token: string) {
    throw new Error('Method not implemented.');
  }

  async getLeaderUserParticipations(userId: number, token: string) {
    throw new Error('Method not implemented.');
  }

}
