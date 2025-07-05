import { LeaderData } from "../interfaces/leader-data.interface";

export abstract class AbstractLeaderRepository {
  abstract getAll(limit: number, skip: number): Promise<LeaderData[]>;
  abstract getOne(id: number): Promise<LeaderData | undefined>;
  abstract getAmount(): Promise<number>;
}