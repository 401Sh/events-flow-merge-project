import { Controller, Get, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetParticipantsQueryDto } from './dto/get-participants-query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly eventsService: UsersService) {}

  @Get(':userId/leaderId')
  async getUser(
    @Req() req,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.eventsService.getLeaderUser(userId);
  }


  @Get(':userId/participations/leaderId')
  async getUserParticipations(
    @Req() req,
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: GetParticipantsQueryDto,
  ) {

    return await this.eventsService.getLeaderUserParticipations(userId, query);
  }
}
