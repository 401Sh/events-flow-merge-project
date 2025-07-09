import { EventThemesDto } from '../dto/event-themes.dto';

export abstract class AbstractTimepadDictionaryRepository {
  abstract getAllThemes(): Promise<EventThemesDto[]>;
}
