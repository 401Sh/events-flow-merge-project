import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GetEventListQueryDto } from './dto/get-event-list-query.dto';
import { EventAPISource } from './enums/event-source.enum';
import { UnifiedEventDto } from './dto/unified-event.dto';
import { LeaderDataDto } from './dto/leader-data.dto';
import { TimepadDataDto } from './dto/timepad-data.dto';
import { LeaderEventService } from './services/leader-event.service';
import { TimepadEventService } from './services/timepad-event.service';
import { EventsListResultDto } from './dto/events-list-result.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly leaderService: LeaderEventService,
    private readonly timepadService: TimepadEventService,
  ) {}

  /**
   * Retrieves data by ID from the specified event API source.
   *
   * @async
   * @param {EventAPISource} source - The source from which to fetch the data.
   * @param {number} id - The ID of the item to retrieve.
   * @returns {Promise<{
   *  data: LeaderDataDto | TimepadDataDto | null
   * }>} A promise that resolves to data object fetched from the source, or
   * null if not found.
   */
  async getFromSourceById(source: EventAPISource, id: number) {
    let data: LeaderDataDto | TimepadDataDto | null = null;

    if (source === EventAPISource.TIMEPAD) {
      data = await this.timepadService.getOne(id);
    } else {
      data = await this.leaderService.getOne(id);
    }

    return { data };
  }


  /**
   * Retrieves a paginated list of events from Leader and Timepad sources.
   *
   * @async
   * @param {GetEventListQueryDto} query - The query parameters including
   * pagination and filters.
   * @returns {Promise<object>} A promise that resolves to an object containing
   * event data and pagination metadata.
   */
  async getEventsList(query: GetEventListQueryDto) {
    // TODO: Add cache
    const { leaderEventsAmount, timepadEventsAmount } =
      await this.getEventsAmount(query);

    const batchData = this.getBatchAtSkip(
      query.limit,
      query.page,
      leaderEventsAmount,
      timepadEventsAmount,
    );

    if (batchData.isEmpty) {
      this.logger.debug('No events found');

      return {
        data: {
          events: [],
        },
        meta: {
          totalEventsAmount: 0,
          totalPagesAmount: 0,
          currentPage: 0,
        },
      };
    }

    const totalEvents = leaderEventsAmount + timepadEventsAmount;
    const totalPagesAmount = this.calculatePagination(totalEvents, query.limit);

    const allEvents = await this.fetchEvents(batchData, query);

    const sortedEvents = this.sortEvents(allEvents);

    this.logger.debug('Finded events: ', sortedEvents);
    return {
      data: sortedEvents,
      meta: {
        totalEventsAmount: leaderEventsAmount + timepadEventsAmount,
        totalPagesAmount: totalPagesAmount,
        currentPage: query.page,
      },
    };
  }


  /**
   * Retrieves a list of events along with metadata from the specified source.
   *
   * @async
   * @param {EventAPISource} source - The source from which to fetch the events.
   * @param {GetEventListQueryDto} query - The query parameters for filtering
   * and pagination.
   * @returns {Promise<EventsListResultDto>} A promise that resolves to events
   * data along with pagination metadata.
   * @throws {NotFoundException} Throws if no events are found for the given
   * source.
   */
  async getEventsListFromSource(
    source: EventAPISource,
    query: GetEventListQueryDto,
  ) {
    let result: EventsListResultDto;

    if (source === EventAPISource.TIMEPAD) {
      result = await this.timepadService.getAllWithMeta(query);
    } else {
      result = await this.leaderService.getAllWithMeta(query);
    }

    if (!result || !result.data) {
      throw new NotFoundException(`Events not found in source ${source}`);
    }

    return result;
  }


  /**
   * Sorts an array of events by their start date in ascending order.
   *
   * @param {UnifiedEventDto[]} events - The array of events to sort.
   * @returns {UnifiedEventDto[]} The sorted array of events.
   * @private
   */
  private sortEvents(events: UnifiedEventDto[]): UnifiedEventDto[] {
    const sortedEvents = events.sort((a, b) => {
      const aDate = a.startsAt ? new Date(a.startsAt).getTime() : 0;
      const bDate = b.startsAt ? new Date(b.startsAt).getTime() : 0;
      return aDate - bDate;
    });

    return sortedEvents;
  }


  /**
   * Retrieves the total number of events from both Leader and Timepad sources
   * based on the query.
   *
   * @async
   * @param {GetEventListQueryDto} query - The query parameters used to filter
   * events.
   * @returns {Promise<{
   * leaderEventsAmount: number; timepadEventsAmount: number
   * }>} A promise that resolves to an object containing event counts from both
   * sources.
   * @private
   */
  private async getEventsAmount(query: GetEventListQueryDto) {
    const [leaderEventsAmount, timepadEventsAmount] = await Promise.all([
      this.leaderService.getAmount(query),
      this.timepadService.getAmount(query),
    ]);

    return { leaderEventsAmount, timepadEventsAmount };
  }


  /**
   * Calculates the total number of pages based on total items and items per
   * page limit.
   *
   * @param {number} totalItems - The total number of items.
   * @param {number} limit - The number of items per page.
   * @returns {number} The total number of pages.
   * @private
   */
  private calculatePagination(totalItems: number, limit: number) {
    const totalPagesAmount = Math.ceil(totalItems / limit);
    return totalPagesAmount;
  }


  /**
   * Fetches events from Leader and Timepad services based on batch data and
   * query parameters.
   *
   * @async
   * @param {{
   *   firstAmount: number;
   *   firstSkip: number;
   *   secondAmount: number;
   *   secondSkip: number;
   * }} batchData - Object containing amounts and offsets for both sources.
   * @param {GetEventListQueryDto} query - The query parameters for filtering
   * and pagination.
   * @returns {Promise<UnifiedEventDto[]>} A promise that resolves to a
   * flattened array of events fetched from both sources.
   * @private
   */
  private async fetchEvents(
    batchData: {
      firstAmount: number;
      firstSkip: number;
      secondAmount: number;
      secondSkip: number;
    },
    query: GetEventListQueryDto,
  ): Promise<UnifiedEventDto[]> {
    const promises: Promise<UnifiedEventDto[]>[] = [];

    // TODO: Refactor
    if (batchData.firstAmount != 0) {
      promises.push(
        this.leaderService.getAll(
          batchData.firstAmount,
          batchData.firstSkip,
          query,
        ),
      );
    }

    if (batchData.secondAmount != 0) {
      promises.push(
        this.timepadService.getAll(
          batchData.secondAmount,
          batchData.secondSkip,
          query,
        ),
      );
    }

    const result = await Promise.all(promises);

    return result.flat();
  }


  /**
   * Calculates how many items to take and skip from two APIs for pagination,
   * balancing the distribution.
   *
   * @param {number} limit - The number of items per page.
   * @param {number} page - The current page number.
   * @param {number} api1Total - Total available items from the first API.
   * @param {number} api2Total - Total available items from the second API.
   * @returns {{
   *   firstSkip: number;
   *   firstAmount: number;
   *   secondSkip: number;
   *   secondAmount: number;
   *   isEmpty: boolean;
   * }} The calculated skip and take amounts for both APIs and a flag
   * indicating if the batch is empty.
   * @private
   */
  private getBatchAtSkip(
    limit: number,
    page: number,
    api1Total: number,
    api2Total: number,
  ) {
    const half = Math.ceil(limit / 2);
    const totalItemsBefore = (page - 1) * limit;

    let firstSkip = 0;
    let secondSkip = 0;

    let tempRest1 = api1Total;
    let tempRest2 = api2Total;
    let skipped = 0;

    while (skipped < totalItemsBefore && (tempRest1 > 0 || tempRest2 > 0)) {
      const { take1, take2 } = this.distributeItems(
        limit,
        half,
        tempRest1,
        tempRest2,
      );

      tempRest1 -= take1;
      tempRest2 -= take2;
      firstSkip += take1;
      secondSkip += take2;
      skipped += take1 + take2;

      if (take1 + take2 === 0) break;
    }

    if (tempRest1 === 0 && tempRest2 === 0) {
      return {
        firstSkip,
        firstAmount: 0,
        secondSkip,
        secondAmount: 0,
        isEmpty: true,
      };
    }

    const { take1, take2 } = this.distributeItems(
      limit,
      half,
      tempRest1,
      tempRest2,
    );

    return {
      firstSkip,
      firstAmount: take1,
      secondSkip,
      secondAmount: take2,
      isEmpty: take1 + take2 === 0,
    };
  }


  /**
   * Distributes the number of items to take from two sources given their
   * remaining counts and a limit.
   *
   * Attempts to evenly split the limit, then fills the remainder from
   * whichever source has available items.
   *
   * @param {number} limit - Total number of items to take.
   * @param {number} half - Half of the limit, used as initial allocation for
   * the first source.
   * @param {number} rest1 - Remaining items available in the first source.
   * @param {number} rest2 - Remaining items available in the second source.
   * @returns {{ take1: number; take2: number }} The number of items to take
   * from each source.
   * @private
   */
  private distributeItems(
    limit: number,
    half: number,
    rest1: number,
    rest2: number,
  ) {
    let need = limit;

    let take1 = Math.min(half, rest1);
    need -= take1;

    let take2 = Math.min(need, rest2);
    need -= take2;

    if (need > 0 && rest1 - take1 > 0) {
      const extra = Math.min(need, rest1 - take1);
      take1 += extra;
      need -= extra;
    } else if (need > 0 && rest2 - take2 > 0) {
      const extra = Math.min(need, rest2 - take2);
      take2 += extra;
      need -= extra;
    }

    return { take1, take2 };
  }
}