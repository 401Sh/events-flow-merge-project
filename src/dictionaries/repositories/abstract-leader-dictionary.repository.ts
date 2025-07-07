import { EventThemes } from "../interfaces/event-themes.interface";

export abstract class AbstractLeaderDictionaryRepository {
  abstract getAllThemes(): Promise<EventThemes[]>;
}