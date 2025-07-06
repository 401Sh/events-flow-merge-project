import { TimepadData } from "../interfaces/timepad-data.interface";

export abstract class AbstractTimepadRepository {
  abstract getAll(limit: number, skip: number): Promise<TimepadData[]>;
  abstract getOne(id: number): Promise<TimepadData | null>;
  abstract getAmount(): Promise<number>;
}