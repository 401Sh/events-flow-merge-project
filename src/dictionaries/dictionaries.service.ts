import { Injectable } from '@nestjs/common';
import { EventAPISource } from 'src/events/enums/event-source.enum';

@Injectable()
export class DictionariesService {
  getEventThemesBySource(source: EventAPISource) {
    throw new Error('Method not implemented.');
  }
}
