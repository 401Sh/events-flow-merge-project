import { DataSource } from 'typeorm';
import * as citiesDataJson from './data/output.json';
import { CityEntity } from '../../geo/entities/city.entity';
import { slugify } from 'transliteration';

type CitySeedItem = {
  properties: {
    int_name?: string;
    name: string;
    population: number;
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
      coordinates: coords, // [longtitude, latitude]
    };

    const intName = props.int_name
      ? props.int_name
      : slugify(props.name, { lowercase: false });

    // city entity
    const city = cityRepo.create({
      intName: intName,
      name: props.name,
      location: location,
      population: props.population,
    });

    await cityRepo.save(city);
  }

  console.log('Cities seed completed');
}