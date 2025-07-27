import { Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Query, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetParticipantsQueryDto } from './dto/get-participants-query.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { VisitedEventsListResultDto } from './dto/visited-event-list-result.dto';
import { UserProfileResultDto } from './dto/user-profile-result.dto';
import { VisitedEventsListWithMetaResultDto } from './dto/visited-event-list-with-meta-result.dto';
import { SimpleAuthGuard } from './guards/simple-auth.guard';

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


  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить список посещенных и предстоящих мероприятий из leaderId',
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
    description: 'Количество посещенных и предстоящих мероприятий на странице',
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
    description: 'Список посещенных и предстоящих мероприятий в leaderId',
    type: VisitedEventsListWithMetaResultDto,
  })
  @UseGuards(SimpleAuthGuard)
  @Get(':userId/leaderId/participations')
  async getLeaderUserParticipations(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: GetParticipantsQueryDto,
    @Request() req,
  ) {
    const token = req.userToken;

    return await this.eventsService.getLeaderUserParticipations(
      token,
      userId, 
      query,
    );
  }


  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить список посещенных/предстоящих мероприятий из leaderId',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Id Пользователя',
    example: 6893310,
  })
  @ApiParam({
    name: 'isCompleted',
    required: true,
    description: 'Фильтрация посещенных или предстоящих мероприятий пользователя.\n' +
      'Если true - в ответе будут посещенные мероприятия.\n' +
      'Если false - в ответе будут предстоящие мероприятия.',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Список посещенных/предстоящих мероприятий в leaderId',
    type: VisitedEventsListResultDto,
  })
  @UseGuards(SimpleAuthGuard)
  @Get(':userId/leaderId/participations/:isCompleted')
  async getLeaderUserEventsHistory(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('isCompleted', ParseBoolPipe) isCompleted: boolean,
    @Request() req,
  ) {
    const token = req.userToken;

    return await this.eventsService.getLeaderUserEventHistory(
      token,
      userId, 
      isCompleted,
    );
  }
}
