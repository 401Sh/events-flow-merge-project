import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { APIEventInterface } from './api-interfaces/api-event.service.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LeaderClientAuthService } from 'src/client-auth/leader-client-auth.service';
import { ConfigService } from '@nestjs/config';
import { GetEventListQueryDto } from '../dto/get-event-list-query.dto';
import { LeaderDataDto } from '../dto/leader-data.dto';
import { DictionariesService } from 'src/dictionaries/dictionaries.service';
import { EventAPISource } from '../enums/event-source.enum';
import { GeoService } from 'src/geo/geo.service';
import { LeaderApiRateLimiterService } from 'src/common/api-utils/leader-api-rate-limiter.service';
import {
  LEADER_EVENT_MIN_AMOUNT,
  LEADER_EVENT_PAGE_LIMIT
} from 'src/common/constants/leader-request.constant';
import { LeaderEventMapperService } from './leader-event-mapper.service';
import { CacheService } from 'src/cache/cache.service';
import { LeaderResponseType } from '../types/leader-response.type';
import { CACHE_LONG_TTL } from 'src/common/constants/cache.constant';

@Injectable()
export class LeaderEventService implements APIEventInterface<LeaderDataDto> {
  private readonly logger = new Logger(LeaderEventService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: LeaderClientAuthService,
    private readonly dictionariesService: DictionariesService,
    private readonly geoService: GeoService,
    private readonly rateLimiter: LeaderApiRateLimiterService,
    private readonly leaderMapper: LeaderEventMapperService,
    private readonly cacheService: CacheService,
  ) {
    this.baseUrl = this.configService.getOrThrow('LEADER_API_URL');
  }

  async getAll(
    limit: number,
    skip: number,
    query: GetEventListQueryDto,
  ): Promise<LeaderDataDto[]> {
    const page = Math.floor(skip / limit) + 1;

    const params = await this.buildSearchParams(query, limit, page);

    const response = await this.fetchFromLeaderApi<{ items: any[] }>(
      '/events/search',
      params,
    );

    const rawEvents = response.items || [];
    const mappedEvents = await Promise.all(
      rawEvents.map(this.leaderMapper.map),
    );

    this.logger.debug('Leader event list recieved successfully');

    return mappedEvents;
  }


  async getAllWithMeta(query: GetEventListQueryDto) {
    const { limit, page } = query;

    const params = await this.buildSearchParams(query, limit, page);

    const data = await this.fetchFromLeaderApi<LeaderResponseType>(
      '/events/search',
      params,
    );
    const rawEvents = data.items || [];
    const mappedEvents = await Promise.all(
      rawEvents.map(this.leaderMapper.map),
    );

    this.logger.debug('Leader event list recieved successfully');

    const maxEvents = query.limit * LEADER_EVENT_PAGE_LIMIT;
    const totalAmount = data.meta?.totalCount || 0;
    const normalizedAmount = totalAmount > maxEvents ? maxEvents : totalAmount;
    const normalizedPageAmount =
      data.meta.paginationPageCount > LEADER_EVENT_PAGE_LIMIT
        ? LEADER_EVENT_PAGE_LIMIT
        : data.meta.paginationPageCount;

    const dataWithMeta = {
      data: mappedEvents,
      meta: {
        totalEventsAmount: normalizedAmount,
        totalPagesAmount: normalizedPageAmount,
        currentPage: data.meta.paginationPage,
      },
    };

    return dataWithMeta;
  }


  async getOne(id: number): Promise<LeaderDataDto | null> {
    const urlPart = `/events/search`;
    const params = {
      paginationSize: LEADER_EVENT_MIN_AMOUNT,
      paginationPage: 1,
      query: id,
    };

    const dataResponce = await this.fetchFromLeaderApi<{ items: any[] }>(
      urlPart,
      params,
    );

    if (!dataResponce.items || dataResponce.items.length == 0) {
      this.logger.log(`Leader event ${id} not found`);
      throw new NotFoundException(
        `Event with id ${id} not found in source leaderId`,
      );
    }

    const normalizedEvent = await this.leaderMapper.map(dataResponce.items[0]);

    this.logger.debug('Leader event recieved successfully');

    return normalizedEvent;
  }


  async getAmount(query: GetEventListQueryDto): Promise<number> {
    const { limit, page, ...otherQuery } = query;
    const cacheKey =
      LeaderEventService.name + this.getAmount.name + JSON.stringify(otherQuery);

    const cachedAmount = await this.cacheService.get<number>(cacheKey);
    if (cachedAmount) {
      return cachedAmount;
    }

    const params = await this.buildSearchParams(query);

    const data = await this.fetchFromLeaderApi<{
      meta: { totalCount: number };
    }>('/events/search', params);

    this.logger.debug('Leader events amount recieved successfully');

    const maxEvents = query.limit * LEADER_EVENT_PAGE_LIMIT;
    const totalAmount = data.meta?.totalCount || 0;
    const normalizedAmount = totalAmount > maxEvents ? maxEvents : totalAmount;

    this.cacheService.set<number>(cacheKey, normalizedAmount);
    return normalizedAmount;
  }


  /**
   * Builds search parameters for Leader API requests based on the provided
   * query.
   *
   * @async
   * @param {GetEventListQueryDto} query - The query object containing filters
   * and search criteria.
   * @param {number} limit - The maximum number of results to return per page.
   * @param {number} [page] - The page number for pagination (optional).
   * @returns {Promise<Record<string, any>>} A promise that resolves to an
   * object with the formatted search parameters.
   * @private
   */
  private async buildSearchParams(
    query: GetEventListQueryDto,
    limit?: number,
    page?: number,
  ): Promise<Record<string, any>> {
    const apiLimit = limit && limit > LEADER_EVENT_MIN_AMOUNT
      ? limit : LEADER_EVENT_MIN_AMOUNT;

    const params: Record<string, any> = {
      paginationSize: apiLimit,
      paginationPage: page,
      sort: 'date',
      query: query.search,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    };

    if (query.themes) {
      const themeIds = await this.dictionariesService.findExternalThemeIds(
        query.themes,
        EventAPISource.LEADER_ID,
      );
      params['themeIds[]'] = themeIds;
    }

    if (query.cityId) {
      const leaderCityId = await this.findLeaderCity(query.cityId);

      params['cityId'] = leaderCityId;
    }

    return params;
  }


  private async findLeaderCity(cityId: number): Promise<number | undefined> {
    const cacheKey = LeaderEventService.name + this.findLeaderCity.name + cityId;

    const cachedCityId = await this.cacheService.get<number>(cacheKey);
    if (cachedCityId) {
      return cachedCityId;
    }

    const city = await this.geoService.findCityById(cityId);
    if (!city) return undefined;

    const leaderCities = await this.fetchFromLeaderApi<any[]>(
      '/cities/search',
      { q: city.name },
    );

    if (leaderCities[0]?.id) {
      this.cacheService.set<number>(cacheKey, leaderCities[0]?.id, CACHE_LONG_TTL);
      return leaderCities[0].id;
    }
    return undefined;
  }


  /**
   * Sends a GET request to the Leader API with the given URL path and query
   * parameters, applying rate limiting to control request throughput.
   * Automatically attaches the Bearer access token to the request headers.
   *
   * Requests are executed through a Bottleneck rate limiter to ensure that
   * outgoing requests conform to configured rate limits.
   *
   * @async
   * @template T
   * @param {string} urlPart - The endpoint path to append to the base URL.
   * @param {object} [params] - Optional query parameters to include in the
   * request.
   * @returns {Promise<T>} A promise resolving to the response data of type T.
   * @throws {HttpException} Throws an HTTP exception if the request fails.
   * @private
   */
  private async fetchFromLeaderApi<T>(
    urlPart: string,
    params?: object,
  ): Promise<T> {
    const url = `${this.baseUrl}${urlPart}`;

    const token = await this.authService.getAccessToken();

    return this.rateLimiter.schedule(async () => {
      try {
        const response = await firstValueFrom(
          this.httpService.get<T>(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: params,
          }),
        );

        this.logger.debug(`Leader API request to ${url} succeeded`);

        return response.data;
      } catch (error) {
        this.logger.warn(
          `Failed to fetch from Leader API URL: ${url}`,
          error?.response?.data || error.message,
        );

        const status =
          error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

        throw new HttpException(
          {
            message: `Leader API request failed for URL: ${url}`,
            details: error?.response?.data || error.message,
          },
          status,
        );
      }
    });
  }
}