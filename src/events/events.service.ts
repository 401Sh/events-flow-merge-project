import { Injectable, Logger } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor() {}

  create(userId: any, data: CreateEventDto) {
    throw new Error('Method not implemented.');
  }


  findById(surveyId: any) {
    throw new Error('Method not implemented.');
  }


  update(eventId: string, data: UpdateEventDto) {
    throw new Error('Method not implemented.');
  }


  delete(eventId: string) {
    throw new Error('Method not implemented.');
  }
}