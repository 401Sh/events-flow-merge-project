import { UnifiedEvent } from "./unified-event.interface";

export interface LeaderParticipant {
  id: number,
  name: string,
  photo: string
}


export interface LeaderSpecificData {
  // stat?.participants?.count
  participantsCount: number
  // stat?.paticipants?.list?[] -> id, name, photo
  participants: LeaderParticipant[]
}


export interface LeaderData extends UnifiedEvent {
  specificData: LeaderSpecificData
}