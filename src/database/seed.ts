// src/database/seed.ts
import { dataSourceOptions } from 'src/configs/typeorm.config';
import { DataSource } from 'typeorm';
import { seedThemes } from './seeds/theme.seed';

async function seed() {
    const dataSource = new DataSource(dataSourceOptions);

  await dataSource.initialize();

  seedThemes(dataSource).catch(e => console.error(e));

  console.log('Seed completed');
  await dataSource.destroy();
}

seed().catch(console.error);
