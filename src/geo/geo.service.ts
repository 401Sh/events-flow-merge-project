import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CityEntity } from './entities/city.entity';
import { Repository } from 'typeorm';
import { CoordinatesDto } from './dto/coordinates.dto';
import { GetCitiesQueryDto } from './dto/get-cities-query.dto';

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);

  constructor(
    @InjectRepository(CityEntity)
    private cityRepository: Repository<CityEntity>,
  ) {}

  getCityList(query: GetCitiesQueryDto) {
    throw new Error('Method not implemented.');
  }
  findNearestCities(cityId: number) {
    throw new Error('Method not implemented.');
  }
  findCityByCoords(coords: CoordinatesDto) {
    throw new Error('Method not implemented.');
  }
}
