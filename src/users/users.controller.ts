import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly eventsService: UsersService) {}

  @Get(':userId/leaderId')
  async getUser(
    @Req() req,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const token = req.userToken;

    return await this.eventsService.getLeaderUser(userId, token);
  }


  @Get(':userId/participations/leaderId')
  async getUserParticipations(
    @Req() req,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const token = req.userToken;

    return await this.eventsService.getLeaderUserParticipations(userId, token);
  }
}
