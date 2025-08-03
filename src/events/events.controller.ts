import { Controller, Post, UseGuards, Request, Patch, Delete, Get, Param, Body } from '@nestjs/common';
import { EventsService } from './events.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { EventOwnerGuard } from './guards/event-owner.guard';
import { CreateEventBodyDto } from './dto/create-event-body.dto';
import { UpdateEventBodyDto } from './dto/update-event-body.dto';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  async create(
    @Request() req,
    @Body() data: CreateEventBodyDto,
  ) {
    const userId = req.user['sub'];
    const result = await this.eventsService.create(userId, data);

    return result;
  }


  @UseGuards(AccessTokenGuard, EventOwnerGuard)
  @Get(':eventId/self')
  async findMyEvent(@Param('eventId') eventId: number) {
    const result = await this.eventsService.findById(eventId);

    return result;
  }


  @UseGuards(AccessTokenGuard, EventOwnerGuard)
  @Patch(':eventId')
  async update(
    @Param('eventId') eventId: number,
    @Body() data: UpdateEventBodyDto
  ) {
    const result = await this.eventsService.update(eventId, data);

    return result;
  }


  @UseGuards(AccessTokenGuard, EventOwnerGuard)
  @Delete(':eventId')
  async delete(@Param('eventId') eventId: number) {
    const result = await this.eventsService.delete(eventId);

    return result;
  }
}