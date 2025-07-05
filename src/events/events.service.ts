import { Injectable } from '@nestjs/common';
import { AbstractLeaderRepository } from './repositories/abstract-leader.repository';
import { GetEventListQueryDto } from './dto/get-event-list-query.dto';
import { UnifiedEvent } from './interfaces/unified-event.interface';
import { SortableFields } from './enums/query-event.enum';
import { AbstractTimepadRepository } from './repositories/abstract-timepad.repository';

@Injectable()
export class EventsService {
  constructor(
    private readonly leaderRepository: AbstractLeaderRepository,
    private readonly timepadRepository: AbstractTimepadRepository,
  ) {}

  getFromSourceById(source: string, id: string) {
    throw new Error('Method not implemented.');
  }


  async getEventsList(query: GetEventListQueryDto) {
    const { limit = 1, skip = 1, sortField = SortableFields.StartsAt, sortOrder = 'asc' } = query;

    // const leaderEvents = this.leaderRepository.getAll(limit, skip);
    // const timepadEvents = this.timepadRepository.getAll(limit, skip);

    // параллельный запрос данных
    const [leaderEvents, timepadEvents] = await Promise.all([
      this.leaderRepository.getAll(limit, skip),
      this.timepadRepository.getAll(limit, skip),
    ]);

    const allEvents: UnifiedEvent[] = [...leaderEvents, ...timepadEvents];
    const sortedEvents = this.sortEvents(allEvents, sortField, sortOrder);

    // пока приходиться брать данные с избытком с API
    // нет что делать, если на одном из API не будет нужного количества
    return sortedEvents.slice(skip, skip + limit);
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
      }
  
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
  
      return 0;
    });
  }
}
