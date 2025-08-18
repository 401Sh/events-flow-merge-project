import { ExternalEventsListResultDto } from '../../dto/events-list-result.dto';
import { GetExternalEventListQueryDto } from '../../dto/get-external-event-list-query.dto';

export interface APIEventInterface<T> {
  /**
   * Retrieves a paginated list of events from the API based on query parameters.
   *
   * @async
   * @param {number} limit - The maximum number of events to retrieve.
   * @param {number} skip - The number of events to skip (offset).
   * @param {GetExternalEventListQueryDto} query - The query parameters to filter the
   * events.
   * @returns {Promise<T[]>} A promise that resolves to an array of event data
   * transfer objects.
   */
  getAll(
    limit: number,
    skip: number,
    query: GetExternalEventListQueryDto,
  ): Promise<T[]>;

  /**
   * Retrieves a paginated list of events from API along with pagination
   * metadata.
   *
   * @async
   * @param {GetExternalEventListQueryDto} query - The event list query parameters
   * including pagination.
   * @returns {Promise<{
   *   data: LeaderDataDto[];
   *   meta: {
   *     totalEventsAmount: number;
   *     totalPagesAmount: number;
   *     currentPage: number;
   *   };
   * }>} A promise that resolves to an object containing the list of events and
   * pagination metadata.
   */
  getAllWithMeta(
    query: GetExternalEventListQueryDto
  ): Promise<ExternalEventsListResultDto>;

  /**
   * Retrieves a single API event by its ID.
   *
   * @async
   * @param {number} id - The ID of the event to retrieve.
   * @returns {Promise<T>} A promise that resolves to the normalized API event
   * data.
   */
  getOne(id: number): Promise<T | null>;

  /**
   * Retrieves the total number of events from the API matching the given query.
   *
   * @async
   * @param {GetExternalEventListQueryDto} query - The query parameters to filter events.
   * @returns {Promise<number>} A promise that resolves to the total count of
   * matching events.
   */
  getAmount(query: GetExternalEventListQueryDto): Promise<number>;
}