import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AbstractLeaderEventRepository } from './repositories/abstract-leader-event.repository';
import { GetEventListQueryDto } from './dto/get-event-list-query.dto';
import { AbstractTimepadEventRepository } from './repositories/abstract-timepad-event.repository';
import { EventsListResult } from './interfaces/events-list-result.interface';
import { EventAPISource } from './enums/event-source.enum';
import { UnifiedEventDto } from './dto/unified-event.dto';
import { LeaderDataDto } from './dto/leader-data.dto';
import { TimepadDataDto } from './dto/timepad-data.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly leaderRepository: AbstractLeaderEventRepository,
    private readonly timepadRepository: AbstractTimepadEventRepository,
  ) {}

  async getFromSourceById(source: EventAPISource, id: number) {
    let data: LeaderDataDto | TimepadDataDto | null = null;

    if (source === EventAPISource.TIMEPAD) {
      data = await this.timepadRepository.getOne(id);
    } else {
      data = await this.leaderRepository.getOne(id);
    }

    return { data };
  }

  
  async getEventsList(query: GetEventListQueryDto) {
    // TODO: Добавить кэширование
    const { leaderEventsAmount, timepadEventsAmount } =
      await this.getEventsAmount();

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
      data: {
        events: sortedEvents,
      },
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
      | EventsListResult<LeaderDataDto>
      | EventsListResult<TimepadDataDto>;

    if (source === EventAPISource.TIMEPAD) {
      result = await this.timepadRepository.getAllWithMeta(query);
    } else {
      result = await this.leaderRepository.getAllWithMeta(query);
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


  private async getEventsAmount() {
    const [leaderEventsAmount, timepadEventsAmount] = await Promise.all([
      this.leaderRepository.getAmount(),
      this.timepadRepository.getAmount(),
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
    const [leaderEvents, timepadEvents] = await Promise.all([
      this.leaderRepository.getAll(
        batchData.firstAmount,
        batchData.firstSkip,
        query,
      ),
      this.timepadRepository.getAll(
        batchData.secondAmount,
        batchData.secondSkip,
        query,
      ),
    ]);

    return [...leaderEvents, ...timepadEvents];
  }


  private getBatchAtSkip(
    limit: number,
    page: number,
    api1Total: number,
    api2Total: number,
  ) {
    let rest1 = api1Total;
    let rest2 = api2Total;
    let firstSkip = 0;
    let secondSkip = 0;

    for (let i = 0; i < page - 1; i++) {
      let need = limit;

      let take1 = Math.min(Math.ceil(limit / 2), rest1);
      need -= take1;

      let take2 = Math.min(need, rest2);
      need -= take2;

      // добор недостающих
      if (need > 0 && rest1 - take1 > 0) {
        const extra = Math.min(need, rest1 - take1);
        take1 += extra;
        need -= extra;
      } else if (need > 0 && rest2 - take2 > 0) {
        const extra = Math.min(need, rest2 - take2);
        take2 += extra;
        need -= extra;
      }

      rest1 -= take1;
      rest2 -= take2;
      firstSkip += take1;
      secondSkip += take2;
    }

    // на случай, если элементы кончились
    if (rest1 === 0 && rest2 === 0) {
      return {
        firstSkip,
        firstAmount: 0,
        secondSkip,
        secondAmount: 0,
        isEmpty: true,
      };
    }

    // рассчет страницы
    let need = limit;

    let take1 = Math.min(Math.ceil(limit / 2), rest1);
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

    return {
      firstSkip,
      firstAmount: take1,
      secondSkip,
      secondAmount: take2,
      isEmpty: take1 + take2 === 0,
    };
  }
}
