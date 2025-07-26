import { EventThemesDto } from 'src/dictionaries/dto/event-themes.dto';
import { EventAPISource } from '../enums/event-source.enum';
import { EventLocation } from './event-location.interface';

export interface UnifiedEvent {
  id: number;
  title: string;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
  registrationStart: string | null;
  registrationEnd: string | null;
  location: EventLocation;
  url: string | null;
  posterUrl: string | null;
  themes: EventThemesDto[];
  organizer: string | null;
  source: EventAPISource;
}
