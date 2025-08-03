import { EventAPISource } from 'src/external-events/enums/event-source.enum';

export interface VisitedEvent {
  uuid: string;
  eventId: number;
  isCompleted: boolean;
  completedAt: string | null;
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