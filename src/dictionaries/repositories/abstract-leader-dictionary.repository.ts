import { EventThemesDto } from '../dto/event-themes.dto';

export abstract class AbstractLeaderDictionaryRepository {
  abstract getAllThemes(): Promise<EventThemesDto[]>;
}
