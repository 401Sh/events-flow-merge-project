import { Injectable, Logger } from '@nestjs/common';
import { GetParticipantsQueryDto } from './dto/get-participants-query.dto';
import { LeaderUserService } from './services/leader-user.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly leaderService: LeaderUserService,
  ) {}

  async getLeaderUser(userId: number) {
    const data = await this.leaderService.getUser(userId);

    return { data };
  }

  
  async getLeaderUserParticipations(
    token: string, 
    userId: number, 
    query: GetParticipantsQueryDto,
  ) {
    const result = await this.leaderService.getUserParticipations(
      token, 
      userId, 
      query,
    );

    return result;
  }


  async getLeaderUserEventHistory(token: string, userId: number, isCompleted: boolean) {
    const result = await this.leaderService.getUserEventHistory(
      token, 
      userId, 
      isCompleted,
    );

    return { data: result };
  }
}
