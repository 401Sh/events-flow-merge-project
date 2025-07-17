import { DataSource } from 'typeorm';
import * as citiesDataJson from './data/output.json';
import { CityEntity } from 'src/geo/entities/city.entity';

type CitySeedItem = {
  properties: {
    int_name: string;
    name: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
};

export async function seedCities(dataSource: DataSource) {
  const cityRepo = dataSource.getRepository(CityEntity);

  const features: CitySeedItem[] = citiesDataJson.features;

  for (const feature of features) {
    const props = feature.properties;
    const coords = feature.geometry.coordinates;

    const location = {
      type: 'Point' as const,
      coordinates: coords, // [долгота, широта]
    };

    // сущность города
    const city = cityRepo.create({
      intName: props.int_name,
      name: props.name,
      location: location,
    });

    await cityRepo.save(city);
  }

  console.log('Cities seed completed');
  await dataSource.destroy();
}
