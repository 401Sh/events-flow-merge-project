export interface EventsListResult<T> {
  data: T[];
  meta: {
    totalEventsAmount: number;
    totalPagesAmount: number;
    currentPage: number;
  };
}
