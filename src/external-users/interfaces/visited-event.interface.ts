import { EventAPISource } from 'src/external-events/enums/event-source.enum';

export interface VisitedEvent {
  uuid: string;
  eventId: number;
  isCompleted: boolean;
  signedUpAt: string;
  completedAt: string | null;
  title: string | null;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
  registrationStart: string | null;
  registrationEnd: string | null;
  url: string | null;
  posterUrl: string | null;
  source: EventAPISource;
}