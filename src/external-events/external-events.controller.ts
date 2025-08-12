import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ExternalEventsService } from './external-events.service';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiParam,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  TimepadEventResultDto,
  LeaderEventResultDto,
} from './dto/event-result.dto';
import { EventsListResultDto } from './dto/events-list-result.dto';
import { GetEventListQueryDto } from './dto/get-event-list-query.dto';
import { EventAPISource } from './enums/event-source.enum';
import {
  LIMIT_EVENT_MIN_VALUE,
  PAGE_START_VALUE,
} from 'src/common/constants/dto-request-limits.constant';

@Controller('external/events')
export class ExternalEventsController {
  constructor(private externalEventsService: ExternalEventsService) {}

  @ApiOperation({
    summary: 'Получить список мероприятий от leaderId и timepad вместе',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество мероприятий на странице',
    example: 10,
    default: LIMIT_EVENT_MIN_VALUE,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер страницы',
    example: 2,
    default: PAGE_START_VALUE,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Фильтр по названию',
    example: 'ФОТО экскурсия',
  })
  @ApiQuery({
    name: 'themes',
    required: false,
    description: 'Фильтр по темам',
    example: [3],
    type: Number,
    isArray: true,
    explode: true,
    style: 'form',
  })
  @ApiQuery({
    name: 'cityId',
    required: false,
    description: 'Фильтр по городу',
    example: 2,
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description: 'Фильтрация мероприятий позднее указанной даты',
    example: '2020-12-30',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description: 'Фильтрация мероприятий раньше указанной даты',
    example: '2020-12-31',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список мероприятий от двух источников',
    type: EventsListResultDto,
  })
  @Get()
  async getEventsList(@Query() query: GetEventListQueryDto) {
    return await this.externalEventsService.getEventsList(query);
  }


  @ApiOperation({
    summary: 'Получить список мероприятий из leaderId или timepad',
  })
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
    default: LIMIT_EVENT_MIN_VALUE,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер страницы',
    example: 2,
    default: PAGE_START_VALUE,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Фильтр по названию',
    example: 'ФОТО экскурсия',
  })
  @ApiQuery({
    name: 'themes',
    required: false,
    description: 'Фильтр по темам',
    example: [3],
    type: Number,
    isArray: true,
    explode: true,
    style: 'form',
  })
  @ApiQuery({
    name: 'cityId',
    required: false,
    description: 'Фильтр по городу',
    example: 2,
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description: 'Фильтрация мероприятий позднее указанной даты',
    example: '2020-12-30',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description: 'Фильтрация мероприятий раньше указанной даты',
    example: '2020-12-31',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список мероприятий от источника',
    type: EventsListResultDto,
  })
  @Get(':source')
  async getEventsListBySource(
    @Param('source', new ParseEnumPipe(EventAPISource)) source: EventAPISource,
    @Query() query: GetEventListQueryDto,
  ) {
    return await this.externalEventsService.getEventsListFromSource(
      source,
      query,
    );
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
  @ApiExtraModels(TimepadEventResultDto, LeaderEventResultDto)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Данные о мероприятии',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(LeaderEventResultDto) },
        { $ref: getSchemaPath(TimepadEventResultDto) },
      ],
    },
  })
  @Get(':source/:eventId')
  async getEventBySource(
    @Param('source', new ParseEnumPipe(EventAPISource)) source: EventAPISource,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return await this.externalEventsService.getFromSourceById(source, eventId);
  }
}