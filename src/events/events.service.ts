import { Injectable, Logger } from '@nestjs/common';
import { CreateEventBodyDto } from './dto/create-event-body.dto';
import { UpdateEventBodyDto } from './dto/update-event-body.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor() {}

  create(userId: any, data: CreateEventBodyDto) {
    throw new Error('Method not implemented.');
  }


  findById(surveyId: any) {
    throw new Error('Method not implemented.');
  }


  update(eventId: string, data: UpdateEventBodyDto) {
    throw new Error('Method not implemented.');
  }


  delete(eventId: string) {
    throw new Error('Method not implemented.');
  }
}