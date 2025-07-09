import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { GetEventListQueryDto } from './dto/get-event-list-query.dto';
import { EventAPISource } from './enums/event-source.enum';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @ApiOperation({ summary: 'Получить список мероприятий от leaderId и timepad вместе' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество мероприятий на странице',
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
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Фильтр по названию',
    example: 'ФОТО экскурсия',
  })
  @ApiResponse({ status: 200, description: 'Список мероприятий источника от двух источников' })
  @Get()
  async getEventsList(@Query() query: GetEventListQueryDto) {
    return await this.eventsService.getEventsList(query);
  }

  @ApiOperation({ summary: 'Получить список мероприятий из leaderId или timepad' })
  @ApiParam({
    name: 'source',
    required: true,
    description: 'Источник мероприятий: leaderId или timepad',
    example: 'timepad',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество мероприятий на странице',
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
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Фильтр по названию',
    example: 'ФОТО экскурсия',
  })
  @ApiResponse({ status: 200, description: 'Список мероприятий от источника' })
  @Get(':source')
  async getEventsListBySource(
    @Param('source', new ParseEnumPipe(EventAPISource)) source: EventAPISource,
    @Query() query: GetEventListQueryDto,
  ) {
    return await this.eventsService.getEventsListFromSource(source, query);
  }


  @ApiOperation({ summary: 'Получить информации о мероприятии по id' })
  @ApiParam({
    name: 'source',
    required: true,
    description: 'Источник мероприятий: leaderId или timepad',
    example: 'timepad',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Id искомого мероприятий',
    example: '744099',
  })
  @ApiResponse({ status: 200, description: 'Данные о мероприятии' })
  @Get(':source/:eventId')
  async getEventBySource(
    @Param('source', new ParseEnumPipe(EventAPISource)) source: EventAPISource,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return await this.eventsService.getFromSourceById(source, eventId);
  }
}
