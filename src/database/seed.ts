// src/database/seed.ts
import { dataSourceOptions } from '../configs/typeorm.config';
import { DataSource } from 'typeorm';
import { seedThemes } from './seeds/theme.seed';
import { seedCities } from './seeds/city.seed';
import { ExternalThemeRefEntity } from '../dictionaries/entities/external-theme.entity';
import { EventThemeEntity } from '../dictionaries/entities/theme.entity';
import { CityEntity } from '../geo/entities/city.entity';

async function seed() {
  const dataSource = new DataSource({
    ...dataSourceOptions,
    entities: [
      EventThemeEntity,
      ExternalThemeRefEntity,
      CityEntity,
    ],
  });

  await dataSource.initialize();

  try {
    await seedThemes(dataSource);
    await seedCities(dataSource);
    
    console.log('Seed completed');
  } catch (e) {
    console.error('Seed failed:', e);
  } finally {
    await dataSource.destroy();
  }
}

seed().catch(console.error);
