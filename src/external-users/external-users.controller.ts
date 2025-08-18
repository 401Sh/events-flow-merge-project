import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ExternalUsersService } from './external-users.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { VisitedEventsListResultDto } from '../external-users/dto/visited-event-list-result.dto';
import { UserProfileResultDto } from '../external-users/dto/user-profile-result.dto';
import { SimpleAuthGuard } from '../external-users/guards/simple-auth.guard';
import { SubscribeLeaderEventDto } from '../external-users/dto/subscribe-leader-event.dto';
import { VisitedEventDto } from '../external-users/dto/visited-event.dto';
import { LeaderParticipationResult } from './dto/leader-participation-result-dto';

@Controller('external/users')
export class ExternalUsersController {
  constructor(private readonly externalUsersService: ExternalUsersService) {}

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
    status: HttpStatus.OK,
    description: 'Профиль пользователя в leaderId',
    type: UserProfileResultDto,
  })
  @Get(':userId/leaderId')
  async getUser(@Param('userId', ParseIntPipe) userId: number) {
    return await this.externalUsersService.getLeaderUser(userId);
  }


  @ApiOperation({
    summary: 'Проверить участие в мероприятии leaderId',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Id Пользователя',
    example: 6893310,
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Id Мероприятия',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: LeaderParticipationResult,
  })
  @Get(':userId/leaderId/participations/:eventId')
  async getLeaderUserParticipations(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return await this.externalUsersService.getLeaderEventParticipations(
      eventId,
      userId,
    );
  }


  @ApiBearerAuth()
  @ApiSecurity('ApiKeyAuth')
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
    description:
      'Фильтрация посещенных или предстоящих мероприятий пользователя.\n' +
      'Если true - в ответе будут посещенные мероприятия.\n' +
      'Если false - в ответе будут предстоящие мероприятия.',
    example: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
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

    return await this.externalUsersService.getLeaderUserEventHistory(
      token,
      userId,
      isCompleted,
    );
  }


  @ApiBearerAuth()
  @ApiSecurity('ApiKeyAuth')
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
    status: HttpStatus.OK,
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

    return await this.externalUsersService.subscribeToLeaderEvent(
      token,
      userId,
      subscribeLeaderEventDto,
    );
  }


  @ApiBearerAuth()
  @ApiSecurity('ApiKeyAuth')
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
    status: HttpStatus.NO_CONTENT,
    description: 'Запись на мероприятие в leaderId успешно отменена',
  })
  @UseGuards(SimpleAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':userId/leaderId/participations/:uuid')
  async unsubscribeToLeaderEvent(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Request() req,
  ) {
    const token = req.userToken;

    return await this.externalUsersService.unsubscribeToLeaderEvent(
      token,
      userId,
      uuid,
    );
  }
}