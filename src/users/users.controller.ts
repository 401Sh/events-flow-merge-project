import { Body, Controller, Delete, Get, HttpCode, Param, ParseBoolPipe, ParseIntPipe, ParseUUIDPipe, Post, Query, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetParticipantsQueryDto } from './dto/get-participants-query.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { VisitedEventsListResultDto } from './dto/visited-event-list-result.dto';
import { UserProfileResultDto } from './dto/user-profile-result.dto';
import { VisitedEventsListWithMetaResultDto } from './dto/visited-event-list-with-meta-result.dto';
import { SimpleAuthGuard } from './guards/simple-auth.guard';
import { SubscribeLeaderEventDto } from './dto/subscribe-leader-event.dto';
import { VisitedEventDto } from './dto/visited-event.dto';

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


  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Записаться на мероприятие leaderId',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Id Пользователя',
    example: 6893310,
  })
  @ApiBody({
    description: 'Данные для записи на мероприятие',
    type: SubscribeLeaderEventDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Мероприятие на которое была произведена запись в leaderId',
    type: VisitedEventDto,
  })
  @UseGuards(SimpleAuthGuard)
  @Post(':userId/leaderId/participations')
  async subscribeToLeaderEvent(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() subscribeLeaderEventDto: SubscribeLeaderEventDto,
    @Request() req,
  ) {
    const token = req.userToken;

    return await this.eventsService.subscribeToLeaderEvent(
      token,
      userId,
      subscribeLeaderEventDto,
    );
  }


  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Отписаться от мероприятия leaderId',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Id Пользователя',
    example: 6893310,
  })
  @ApiParam({
    name: 'uuid',
    required: true,
    description: 'UUID записи на мероприятие',
    example: '158a3f67-1eba-46cd-bb85-34767232149d',
  })
  @ApiResponse({
    status: 204,
    description: 'Запись на мероприятие в leaderId успешно отменена',
  })
  @UseGuards(SimpleAuthGuard)
  @HttpCode(204)
  @Delete(':userId/leaderId/participations/:uuid')
  async unsubscribeToLeaderEvent(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Request() req,
  ) {
    const token = req.userToken;

    await this.eventsService.unsubscribeToLeaderEvent(
      token,
      userId,
      uuid,
    );
  }
}
