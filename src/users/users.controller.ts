import { Controller, Get, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetParticipantsQueryDto } from './dto/get-participants-query.dto';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { VisitedEventsListResultDto } from './dto/visited-event-list-result.dto';
import { UserProfileResultDto } from './dto/user-profile-result.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly eventsService: UsersService) {}

  @ApiOperation({
    summary: 'Получить профиль пользователя из leaderId',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Id Пользователя',
    example: 6893310,
  })
  @ApiResponse({
    status: 200,
    description: 'Профиль пользователя в leaderId',
    type: UserProfileResultDto,
  })
  @Get(':userId/leaderId')
  async getUser(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.eventsService.getLeaderUser(userId);
  }


  @ApiOperation({
    summary: 'Получить список посещенных мероприятий из leaderId',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Id Пользователя',
    example: 6893310,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество посещенных мероприятий на странице',
    example: 10,
    default: 4,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер страницы',
    example: 2,
    default: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Список посещенных мероприятий в leaderId',
    type: VisitedEventsListResultDto,
  })
  @Get(':userId/participations/leaderId')
  async getUserParticipations(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: GetParticipantsQueryDto,
  ) {

    return await this.eventsService.getLeaderUserParticipations(userId, query);
  }
}
