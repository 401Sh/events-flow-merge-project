import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
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

  
  @Get(':source/:eventId')
  async getEventBySource(
    @Param('source', ParseUUIDPipe) source: EventAPISource,
    @Param('eventId', ParseUUIDPipe) eventId: number
  ) {
    return await this.eventsService.getFromSourceById(source, eventId);
  }
}
