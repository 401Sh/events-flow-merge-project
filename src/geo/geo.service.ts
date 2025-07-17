import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CityEntity } from './entities/city.entity';
import { In, Repository } from 'typeorm';
import { CoordinatesDto } from './dto/coordinates.dto';
import { GetCitiesQueryDto } from './dto/get-cities-query.dto';
import { GetNearestCitiesQueryDto } from './dto/get-nearest-cities-query.dto';

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);

  constructor(
    @InjectRepository(CityEntity)
    private cityRepository: Repository<CityEntity>,
  ) {}

  async findCityList(query: GetCitiesQueryDto) {
    const { limit, page, search } = query;

    const queryBuilder = this.cityRepository.createQueryBuilder('cities');

    if (search) {
      queryBuilder.where(
        '(cities.name Like :search OR cities.intName LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    queryBuilder.skip((page - 1) * limit).take(limit);
    // queryBuilder.addSelect([
    //   "cities.id",
    //   "cities.name",
    //   "cities.intName",
    // ])

    const [cities, citiesCount] = await queryBuilder.getManyAndCount();
    const totalPagesAmount = Math.ceil(citiesCount / query.limit);

    this.logger.debug('Get cities list: ', cities);
    return {
      data: cities,
      meta: {
        totalCitiesCount: citiesCount,
        totalPagesAmount: totalPagesAmount,
        currentPage: page,
      },
    };
  }


  async findNearestCities(cityId: number, query: GetNearestCitiesQueryDto) {
    const { limit } = query;

    const city = await this.cityRepository.findOne({
      where: { id: cityId },
      select: ['location'],
    });

    if (!city) {
      this.logger.debug(`City with id ${cityId} not found`);
      throw new NotFoundException('City not found');
    }

    const nearest = await this.cityRepository
      .createQueryBuilder('cities')
      .where('cities.id != :cityId', { cityId })
      .orderBy(
        'cities.location <-> ST_SetSRID(ST_GeomFromWKB(:cityLocation), 4326)',
      )
      .setParameter('cityLocation', city.location)
      .limit(limit)
      .getMany();

    this.logger.debug('Get cities list: ', nearest);
    return { data: nearest };
  }


  async findCityByCoords(coords: CoordinatesDto) {
    const { longitude, latitude } = coords;

    const city = await this.cityRepository
      .createQueryBuilder('cities')
      .orderBy('cities.location <-> ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)')
      .setParameters({ lng: longitude, lat: latitude })
      // .addSelect([
      //   'cities.id',
      //   'cities.name',
      //   'cities.intName',
      // ])
      .limit(1)
      .getOne();

    if (!city) {
      this.logger.debug(`City not found by coords: `, coords);
      throw new NotFoundException('City not found');
    }

    this.logger.debug('Get cities by coords: ', city);
    return city;
  }


  async findCityById(cityId: number) {
    const city = await this.cityRepository.findOne({
      where: {
        id: cityId,
      },
    });

    return city;
  }
}
