export interface EventResultWithMeta<T> {
  data: T[],
  meta: {
    totalEventsAmount: number,
    totalPagesAmount: number,
    currentPage: number
  }
}