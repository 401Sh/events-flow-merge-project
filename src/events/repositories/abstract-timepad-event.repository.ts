import { GetEventListQueryDto } from '../dto/get-event-list-query.dto';
import { TimepadDataDto } from '../dto/timepad-data.dto';
import { EventsListResult } from '../interfaces/events-list-result.interface';

export abstract class AbstractTimepadEventRepository {
  abstract getAll(
    limit: number,
    skip: number,
    query: GetEventListQueryDto,
  ): Promise<TimepadDataDto[]>;
  abstract getAllWithMeta(
    query: GetEventListQueryDto,
  ): Promise<EventsListResult<TimepadDataDto>>;
  abstract getOne(id: number): Promise<TimepadDataDto | null>;
  abstract getAmount(): Promise<number>;
}
