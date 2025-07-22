import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AbstractLeaderUserRepository } from './repositories/abstract-leader-user.repository';
import { GetParticipantsQueryDto } from './dto/get-participants-query.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly leaderRepository: AbstractLeaderUserRepository,
  ) {}

  async getLeaderUser(userId: number) {
    const data = await this.leaderRepository.getUser(userId);

    return { data };
  }

  
  async getLeaderUserParticipations(userId: number, query: GetParticipantsQueryDto) {
    const result = await this.leaderRepository.getUserParticipations(userId, query);

    return result;
  }
}
