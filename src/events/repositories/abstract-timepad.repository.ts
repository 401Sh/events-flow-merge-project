import { EventResultWithMeta } from "../interfaces/events-result-with-meta.interface";
import { TimepadData } from "../interfaces/timepad-data.interface";

export abstract class AbstractTimepadRepository {
  abstract getAll(limit: number, skip: number): Promise<TimepadData[]>;
  abstract getAllWithMeta(limit: number, page: number): Promise<EventResultWithMeta<TimepadData>>;
  abstract getOne(id: number): Promise<TimepadData | null>;
  abstract getAmount(): Promise<number>;
}