import { GetEventListQueryDto } from '../dto/get-event-list-query.dto';
import { TimepadDataDto } from '../dto/timepad-data.dto';
import { EventResultWithMeta } from '../interfaces/events-result-with-meta.interface';

export abstract class AbstractTimepadEventRepository {
  abstract getAll(
    limit: number,
    skip: number,
    query: GetEventListQueryDto,
  ): Promise<TimepadDataDto[]>;
  abstract getAllWithMeta(
    query: GetEventListQueryDto,
  ): Promise<EventResultWithMeta<TimepadDataDto>>;
  abstract getOne(id: number): Promise<TimepadDataDto | null>;
  abstract getAmount(): Promise<number>;
}
