import { Controller, Get, Param, ParseEnumPipe, ParseIntPipe, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { GetEventListQueryDto } from './dto/get-event-list-query.dto';
import { EventAPISource } from './enums/event-source.enum';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  async getEventsList(
    @Query() query: GetEventListQueryDto
  ) {
    return await this.eventsService.getEventsList(query);
  }


  @Get(':source')
  async getEventsListBySource(
    @Param('source', new ParseEnumPipe(EventAPISource)) source: EventAPISource,
    @Query() query: GetEventListQueryDto
  ) {
    return await this.eventsService.getEventsListFromSource(source, query);
  }


  @Get(':source/:eventId')
  async getEventBySource(
    @Param('source', new ParseEnumPipe(EventAPISource)) source: EventAPISource,
    @Param('eventId', ParseIntPipe) eventId: number
  ) {
    return await this.eventsService.getFromSourceById(source, eventId);
  }
}
