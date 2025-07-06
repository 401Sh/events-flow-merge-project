import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AbstractLeaderRepository } from './repositories/abstract-leader.repository';
import { GetEventListQueryDto } from './dto/get-event-list-query.dto';
import { UnifiedEvent } from './interfaces/unified-event.interface';
import { SortableFields } from './enums/query-event.enum';
import { AbstractTimepadRepository } from './repositories/abstract-timepad.repository';
import { EventsListResult } from './interfaces/events-list-result.interface';
import { EventAPISource } from './enums/event-source.enum';
import { LeaderData } from './interfaces/leader-data.interface';
import { TimepadData } from './interfaces/timepad-data.interface';
import { EventResultWithMeta } from './interfaces/events-result-with-meta.interface';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly leaderRepository: AbstractLeaderRepository,
    private readonly timepadRepository: AbstractTimepadRepository,
  ) {}


  async getFromSourceById(source: EventAPISource, id: number) {
    let data: LeaderData | TimepadData | null = null;
  
    if (source === EventAPISource.TIMEPAD) {
      data = await this.timepadRepository.getOne(id);
    } else {
      data = await this.leaderRepository.getOne(id);
    };

    if (!data) {
      throw new NotFoundException(`Event with id ${id} not found in source ${source}`);
    };
  
    return { data };
  }


  async getEventsList(query: GetEventListQueryDto): Promise<EventsListResult> {
    const {
      limit = 4,
      page = 1,
      sortField = SortableFields.StartsAt,
      sortOrder = 'asc'
    } = query;

    // подсчет данных
    // крайне важно потом закэшировать ее
    const [leaderEventsAmount, timepadEventsAmount] = await Promise.all([
      this.leaderRepository.getAmount(),
      this.timepadRepository.getAmount()
    ]);

    // определение сколько нужно взять и пропустить из каждого источника
    const batchData = this.getBatchAtSkip(
      limit,
      page,
      leaderEventsAmount,
      timepadEventsAmount
    );

    // если ивентов нет
    if (batchData.isEmpty) {
      this.logger.debug('No events found');

      return {
        data: {
          events: []
        },
        meta: {
          totalEventsAmount: 0,
          totalPagesAmount: 0,
          currentPage: 0
        }
      };
    };

    // определение количества страниц
    const totalPagesAmount = Math.ceil(
      (leaderEventsAmount + timepadEventsAmount) / limit
    );

    console.dir(batchData, {depth:5})
    // параллельный запрос данных ивентов
    const [leaderEvents, timepadEvents] = await Promise.all([
      this.leaderRepository.getAll(batchData.firstAmount, batchData.firstSkip),
      this.timepadRepository.getAll(batchData.secondAmount, batchData.secondSkip)
    ]);

    // слияние и сортировка
    const allEvents: UnifiedEvent[] = [...leaderEvents, ...timepadEvents];
    const sortedEvents = this.sortEvents(allEvents, sortField, sortOrder);

    this.logger.debug('Finded events: ', sortedEvents);
    return {
      data: {
        events: sortedEvents
      },
      meta: {
        totalEventsAmount: leaderEventsAmount + timepadEventsAmount,
        totalPagesAmount: totalPagesAmount,
        currentPage: page
      }
    };
  }

  
  async getEventsListFromSource(source: EventAPISource, query: GetEventListQueryDto) {
    const {
      limit = 4,
      page = 1,
      sortField = SortableFields.StartsAt,
      sortOrder = 'asc'
    } = query;
    
    let result: EventResultWithMeta<LeaderData> | EventResultWithMeta<TimepadData>;
  
    if (source === EventAPISource.TIMEPAD) {
      result = await this.timepadRepository.getAllWithMeta(limit, page);
    } else {
      result = await this.leaderRepository.getAllWithMeta(limit, page);
    };

    if (!result || !result.data) {
      throw new NotFoundException(`Events not found in source ${source}`);
    };
  
    return result;
  }

  
  // убогий вариант сортировочной функции
  // нужно попытаться улучшить
  private sortEvents(
    events: UnifiedEvent[],
    sortBy: string = SortableFields.StartsAt,
    sortOrder: string = 'asc',
  ): UnifiedEvent[] {
    return [...events].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
  
      if (sortBy === 'startsAt' || sortBy === 'endsAt') {
        const aDate = aVal ? new Date(aVal as string).getTime() : 0;
        const bDate = bVal ? new Date(bVal as string).getTime() : 0;
        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      };
  
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      };
  
      return 0;
    });
  }


  // функция для определения сколько пропустить и взять в каждом из api
  // в данный момент лучшее, что я придумал
  private getBatchAtSkip(
    limit: number,
    page: number,
    api1Total: number,
    api2Total: number
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
  
      // добор
      if (need > 0 && rest1 - take1 > 0) {
        const extra = Math.min(need, rest1 - take1);
        take1 += extra;
        need -= extra;
      } else if (need > 0 && rest2 - take2 > 0) {
        const extra = Math.min(need, rest2 - take2);
        take2 += extra;
        need -= extra;
      };
  
      rest1 -= take1;
      rest2 -= take2;
      firstSkip += take1;
      secondSkip += take2;
    };
  
    // на случай, если элементы кончились
    if (rest1 === 0 && rest2 === 0) {
      return {
        firstSkip,
        firstAmount: 0,
        secondSkip,
        secondAmount: 0,
        isEmpty: true
      };
    };
  
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
    };
  
    return {
      firstSkip,
      firstAmount: take1,
      secondSkip,
      secondAmount: take2,
      isEmpty: take1 + take2 === 0
    };
  }
}
