import { GetEventListQueryDto } from '../dto/get-event-list-query.dto';
import { LeaderDataDto } from '../dto/leader-data.dto';
import { EventsListResult } from '../interfaces/events-list-result.interface';

export abstract class AbstractLeaderEventRepository {
  abstract getAll(
    limit: number,
    skip: number,
    query: GetEventListQueryDto,
  ): Promise<LeaderDataDto[]>;
  abstract getAllWithMeta(
    query: GetEventListQueryDto,
  ): Promise<EventsListResult<LeaderDataDto>>;
  abstract getOne(id: number): Promise<LeaderDataDto | null>;
  abstract getAmount(query: GetEventListQueryDto): Promise<number>;
}
