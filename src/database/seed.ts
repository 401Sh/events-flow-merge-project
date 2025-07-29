import { seedThemes } from './seeds/theme.seed';
import { seedCities } from './seeds/city.seed';
import { dataSource } from './data-source';

async function seed() {
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