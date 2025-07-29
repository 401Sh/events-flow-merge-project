import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CityEntity } from './entities/city.entity';
import { In, Repository } from 'typeorm';
import { CoordinatesDto } from './dto/coordinates.dto';
import { GetCitiesQueryDto } from './dto/get-cities-query.dto';
import { GetNearestCitiesQueryDto } from './dto/get-nearest-cities-query.dto';
import { DEFAULT_SRID } from 'src/constants/geospatial.constant';

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);

  constructor(
    @InjectRepository(CityEntity)
    private cityRepository: Repository<CityEntity>,
  ) {}

  /**
   * Retrieves a paginated list of cities filtered by an optional search term.
   *
   * @async
   * @param {GetCitiesQueryDto} query - The query parameters including limit, 
   * page, and optional search term.
   * @returns {Promise<{ 
   * data: CityEntity[], 
   * meta: { 
   *  totalCitiesCount: number; 
   *  totalPagesAmount: number; 
   *  currentPage: number } }>} A promise that resolves to an object containing 
   * the list of cities and pagination metadata.
   */
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
    queryBuilder.select([
      'cities.id',
      'cities.name',
      'cities.intName',
      'cities.posterUrl',
    ])

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


  /**
   * Finds the nearest cities to a given city, excluding the city itself.
   *
   * @async
   * @param {number} cityId - The ID of the city to find neighbors for.
   * @param {GetNearestCitiesQueryDto} query - Query params containing the 
   * limit of results to return.
   * @returns {Promise<{ data: CityEntity[] }>} A promise that resolves to an 
   * object with an array of nearest city entities.
   *
   * @throws {NotFoundException} When the city with the provided ID does not 
   * exist.
   */
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

    // приведение geojson формата координат к wkt
    const { coordinates } = city.location;
    const wkt = `POINT(${coordinates[0]} ${coordinates[1]})`;

    const nearest = await this.cityRepository
      .createQueryBuilder('cities')
      .where('cities.id != :cityId', { cityId })
      .orderBy(
        `cities.location <-> ST_SetSRID(ST_GeomFromText(:cityLocation), ${DEFAULT_SRID})`,
      )
      .setParameter('cityLocation', wkt)
      .select([
        'cities.id',
        'cities.name',
        'cities.intName',
        'cities.posterUrl',
        'cities.location',
      ])
      .limit(limit)
      .getMany();

    this.logger.debug('Get cities list: ', nearest);
    return { data: nearest };
  }


  /**
   * Finds the nearest city based on given geographic coordinates.
   *
   * @param {CoordinatesDto} coords - An object containing longitude and 
   * latitude.
   * @param {number} coords.longitude - The longitude of the location.
   * @param {number} coords.latitude - The latitude of the location.
   * @returns {Promise<Object>} A promise that resolves to the city object 
   * containing id, name, intName, posterUrl, and location.
   * @throws {NotFoundException} Throws an error if no city is found near the 
   * given coordinates.
   */
  async findCityByCoords(coords: CoordinatesDto) {
    const { longitude, latitude } = coords;

    const city = await this.cityRepository
      .createQueryBuilder('cities')
      .orderBy(`cities.location <-> ST_SetSRID(ST_MakePoint(:lng, :lat), ${DEFAULT_SRID})`)
      .setParameters({ lng: longitude, lat: latitude })
      .select([
        'cities.id',
        'cities.name',
        'cities.intName',
        'cities.posterUrl',
        'cities.location',
      ])
      .limit(1)
      .getOne();

    if (!city) {
      this.logger.debug(`City not found by coords: `, coords);
      throw new NotFoundException('City not found');
    }

    this.logger.debug('Get cities by coords: ', city);
    return city;
  }


  /**
   * Finds a city by its unique identifier.
   *
   * @param {number} cityId - The unique ID of the city to find.
   * @returns {Promise<Object|null>} A promise that resolves to the city object 
   * with selected fields, or null if not found.
   */
  async findCityById(cityId: number) {
    const city = await this.cityRepository.findOne({
      where: {
        id: cityId,
      },
      select: [
        'id',
        'intName',
        'name',
        'posterUrl',
        'location',
      ],
    });

    return city;
  }
}
