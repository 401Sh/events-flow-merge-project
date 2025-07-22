import { EventAPISource } from 'src/events/enums/event-source.enum';

export interface VisitedEvent {
  uuid: string;
  eventId: number;
  completed: boolean;
  completedAt: string;
  signedUpAt: string;
  title: string;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
  registrationStart: string | null;
  registrationEnd: string | null;
  url: string | null;
  posterUrl: string | null;
  source: EventAPISource;
}