import { EventsListResultDto } from '../dto/events-list-result.dto';
import { GetEventListQueryDto } from '../dto/get-event-list-query.dto';

export interface APIEventInterface<T> {
  getAll(
    limit: number,
    skip: number,
    query: GetEventListQueryDto,
  ): Promise<T[]>;
  getAllWithMeta(
    query: GetEventListQueryDto,
  ): Promise<EventsListResultDto>;
  getOne(id: number): Promise<T | null>;
  getAmount(query: GetEventListQueryDto): Promise<number>;
}
