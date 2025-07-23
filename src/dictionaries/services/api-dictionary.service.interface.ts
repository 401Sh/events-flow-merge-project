import { EventThemesDto } from '../dto/event-themes.dto';

export interface APIDictionaryInterface {
  getAllThemes(): Promise<EventThemesDto[]>;
}
