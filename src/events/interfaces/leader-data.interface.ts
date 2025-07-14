import { UnifiedEvent } from './unified-event.interface';

export interface LeaderParticipant {
  id: number;
  name: string;
  photo: string;
}

export interface LeaderSpecificData {
  participantsCount: number;
  participants: LeaderParticipant[];
}

export interface LeaderData extends UnifiedEvent {
  specificData: LeaderSpecificData;
}
