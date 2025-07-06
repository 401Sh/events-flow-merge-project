import { EventResultWithMeta } from "../interfaces/events-result-with-meta.interface";
import { LeaderData } from "../interfaces/leader-data.interface";

export abstract class AbstractLeaderRepository {
  abstract getAll(limit: number, skip: number): Promise<LeaderData[]>;
  abstract getAllWithMeta(limit: number, page: number): Promise<EventResultWithMeta<LeaderData>>;
  abstract getOne(id: number): Promise<LeaderData | null>;
  abstract getAmount(): Promise<number>;
}