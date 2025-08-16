import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiSecurity('ApiKeyAuth')
  @ApiOperation({
    summary: 'Получить список посещенных/предстоящих мероприятий',
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
    description: 'Список посещенных/предстоящих мероприятий',
  })
  @Get('participations/:isCompleted')
  @UseGuards(AccessTokenGuard)
  async getLeaderUserEventsHistory(
    @Param('isCompleted', ParseBoolPipe) isCompleted: boolean,
    @Request() req,
  ) {
    const userId = req.user['sub'];

    return await this.usersService.getUserEventHistory(userId, isCompleted);
  }


  @ApiBearerAuth()
  @ApiSecurity('ApiKeyAuth')
  @ApiOperation({
    summary: 'Записаться на мероприятие',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Id мероприятия',
    example: 6893310,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Мероприятие на которое была произведена запись',
  })
  @Post('participations/:eventId')
  @UseGuards(AccessTokenGuard)
  async subscribeEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Request() req,
  ) {
    const userId = req.user['sub'];

    return await this.usersService.subscribeToEvent(userId, eventId);
  }


  @ApiBearerAuth()
  @ApiSecurity('ApiKeyAuth')
  @ApiOperation({
    summary: 'Отписаться от мероприятия leaderId',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Id мероприятия',
    example: 6893310,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Запись на мероприятие успешно отменена',
  })
  @Delete('participations/:eventId')
  @UseGuards(AccessTokenGuard)
  async unsubscribeToEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Request() req,
  ) {
    const userId = req.user['sub'];

    await this.usersService.unsubscribeToEvent(userId, eventId);
  }
}