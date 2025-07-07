import { GetEventListQueryDto } from "../dto/get-event-list-query.dto";
import { EventResultWithMeta } from "../interfaces/events-result-with-meta.interface";
import { LeaderData } from "../interfaces/leader-data.interface";

export abstract class AbstractLeaderEventRepository {
  abstract getAll(
    limit: number, 
    skip: number, 
    query: GetEventListQueryDto
  ): Promise<LeaderData[]>;
  abstract getAllWithMeta(
    query: GetEventListQueryDto
  ): Promise<EventResultWithMeta<LeaderData>>;
  abstract getOne(id: number): Promise<LeaderData | null>;
  abstract getAmount(): Promise<number>;
}