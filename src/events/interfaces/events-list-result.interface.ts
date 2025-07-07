import { UnifiedEvent } from './unified-event.interface';

export interface EventsListResult {
  data: {
    events: UnifiedEvent[];
  };
  meta: {
    totalEventsAmount: number;
    totalPagesAmount: number;
    currentPage: number;
  };
}
