import { UnifiedEvent } from "./unified-event.interface";

export interface TimepadSpecificData {
  // is_sending_free_tickets
  isSendingFreeTickets: boolean | null
}


export interface TimepadData extends UnifiedEvent {
  specificData: TimepadSpecificData
}