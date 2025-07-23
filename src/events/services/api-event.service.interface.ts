import { GetEventListQueryDto } from '../dto/get-event-list-query.dto';
import { EventsListResult } from '../interfaces/events-list-result.interface';

export interface APIEventInterface<T> {
  getAll(
    limit: number,
    skip: number,
    query: GetEventListQueryDto,
  ): Promise<T[]>;
  getAllWithMeta(
    query: GetEventListQueryDto,
  ): Promise<EventsListResult<T>>;
  getOne(id: number): Promise<T | null>;
  getAmount(query: GetEventListQueryDto): Promise<number>;
}
