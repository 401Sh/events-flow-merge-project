import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { GetEventListQueryDto } from './dto/get-event-list-query.dto';

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
    @Param('source', ParseUUIDPipe) source: 'timepad' | 'leader',
    @Param('eventId', ParseUUIDPipe) eventId: string
  ) {
    return await this.eventsService.getFromSourceById(source, eventId);
  }
}
