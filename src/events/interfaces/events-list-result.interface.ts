import { UnifiedEvent } from "./unified-event.interface"

export interface EventsListResult {
  data: {
    events: UnifiedEvent[]
  },
  meta: {
    totalEvents: number,
    totalPageAmount: number,
    currentPage: number
  }
}