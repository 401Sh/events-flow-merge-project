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

  async getFromSourceById(source: EventAPISource, id: number) {
    let data: LeaderDataDto | TimepadDataDto | null = null;

    if (source === EventAPISource.TIMEPAD) {
      data = await this.timepadService.getOne(id);
    } else {
      data = await this.leaderService.getOne(id);
    }

    return { data };
  }

  
  async getEventsList(query: GetEventListQueryDto) {
    // TODO: Добавить кэширование
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


  async getEventsListFromSource(
    source: EventAPISource,
    query: GetEventListQueryDto,
  ) {
    let result:
      | EventsListResultDto
      | EventsListResultDto;

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


  private sortEvents(events: UnifiedEventDto[]): UnifiedEventDto[] {
    const sortedEvents = events.sort((a, b) => {
      const aDate = a.startsAt ? new Date(a.startsAt).getTime() : 0;
      const bDate = b.startsAt ? new Date(b.startsAt).getTime() : 0;
      return aDate - bDate;
    });

    return sortedEvents;
  }


  private async getEventsAmount(query: GetEventListQueryDto) {
    const [leaderEventsAmount, timepadEventsAmount] = await Promise.all([
      this.leaderService.getAmount(query),
      this.timepadService.getAmount(query),
    ]);

    return { leaderEventsAmount, timepadEventsAmount };
  }

  private calculatePagination(totalItems: number, limit: number) {
    const totalPagesAmount = Math.ceil(totalItems / limit);
    return totalPagesAmount;
  }


  private async fetchEvents(
    batchData: {
      firstAmount: number;
      firstSkip: number;
      secondAmount: number;
      secondSkip: number;
    },
    query: GetEventListQueryDto,
  ): Promise<UnifiedEventDto[]> {
    let promises: Promise<UnifiedEventDto[]>[] = [];
    
    // TODO: Отрефакторить
    if (batchData.firstAmount != 0) {
      promises.push(
        this.leaderService.getAll(
          batchData.firstAmount,
          batchData.firstSkip,
          query,
        )
      );
    }

    if (batchData.secondAmount != 0) {
      promises.push(
        this.timepadService.getAll(
          batchData.secondAmount,
          batchData.secondSkip,
          query,
        )
      );
    }

    const result = await Promise.all(promises);

    return result.flat();
  }

  
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
      const { take1, take2 } = this.distributeItems(limit, half, tempRest1, tempRest2);
  
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
  
    const { take1, take2 } = this.distributeItems(limit, half, tempRest1, tempRest2);
  
    return {
      firstSkip,
      firstAmount: take1,
      secondSkip,
      secondAmount: take2,
      isEmpty: take1 + take2 === 0,
    };
  }


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
