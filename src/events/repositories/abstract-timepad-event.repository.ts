import { GetEventListQueryDto } from '../dto/get-event-list-query.dto';
import { EventResultWithMeta } from '../interfaces/events-result-with-meta.interface';
import { TimepadData } from '../interfaces/timepad-data.interface';

export abstract class AbstractTimepadEventRepository {
  abstract getAll(
    limit: number,
    skip: number,
    query: GetEventListQueryDto,
  ): Promise<TimepadData[]>;
  abstract getAllWithMeta(
    query: GetEventListQueryDto,
  ): Promise<EventResultWithMeta<TimepadData>>;
  abstract getOne(id: number): Promise<TimepadData | null>;
  abstract getAmount(): Promise<number>;
}
