import { EventThemes } from "../interfaces/event-themes.interface";

export abstract class AbstractTimepadDictionaryRepository {
  abstract getAllThemes(): Promise<EventThemes[]>;
}