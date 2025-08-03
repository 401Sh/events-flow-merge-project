import { UnifiedEvent } from './unified-event.interface';

export interface TimepadSpecificData {
  isSendingFreeTickets: boolean | null;
}

export interface TimepadData extends UnifiedEvent {
  specificData: TimepadSpecificData;
}