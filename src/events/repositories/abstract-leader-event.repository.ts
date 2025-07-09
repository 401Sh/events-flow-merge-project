import { GetEventListQueryDto } from '../dto/get-event-list-query.dto';
import { LeaderDataDto } from '../dto/leader-data.dto';
import { EventResultWithMeta } from '../interfaces/events-result-with-meta.interface';

export abstract class AbstractLeaderEventRepository {
  abstract getAll(
    limit: number,
    skip: number,
    query: GetEventListQueryDto,
  ): Promise<LeaderDataDto[]>;
  abstract getAllWithMeta(
    query: GetEventListQueryDto,
  ): Promise<EventResultWithMeta<LeaderDataDto>>;
  abstract getOne(id: number): Promise<LeaderDataDto | null>;
  abstract getAmount(): Promise<number>;
}
