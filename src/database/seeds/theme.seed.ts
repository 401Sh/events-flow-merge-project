import { DataSource } from 'typeorm';
import * as themesDataJson from './data/common-themes.json';
import { ExternalThemeRefEntity } from '../../dictionaries/entities/external-theme.entity';
import { EventThemeEntity } from '../../dictionaries/entities/theme.entity';
import { EventAPISource } from '../../events/enums/event-source.enum';

type ThemeSeedItem = {
  timepad: number;
  leaderId: number[];
  name: string;
  tag: string;
};

export async function seedThemes(dataSource: DataSource) {
  const themeRepo = dataSource.getRepository(EventThemeEntity);
  const externalRefRepo = dataSource.getRepository(ExternalThemeRefEntity);

  const themes: ThemeSeedItem[] = themesDataJson.data.themes;

  for (const item of themes) {
    // сущности тем
    const theme = themeRepo.create({
      name: item.name,
      tag: item.tag,
      isActive: true,
    });

    await themeRepo.save(theme);

    const externalRefs: ExternalThemeRefEntity[] = [];

    // сущность и связи с leader
    if (Array.isArray(item.leaderId)) {
      for (const leaderIdValue of item.leaderId) {
        externalRefs.push(
          externalRefRepo.create({
            source: EventAPISource.LEADER_ID,
            sourceId: leaderIdValue,
            eventTheme: theme,
          }),
        );
      }
    }

    // сущность и связь с timepad
    if (item.timepad) {
      externalRefs.push(
        externalRefRepo.create({
          source: EventAPISource.TIMEPAD,
          sourceId: item.timepad,
          eventTheme: theme,
        }),
      );
    }

    if (externalRefs.length > 0) {
      await externalRefRepo.save(externalRefs);
    }
  }

  console.log('Themes seed completed');
}
