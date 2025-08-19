import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { APIEventInterface } from './api-interfaces/api-event.service.interface';
import { HttpService } from '@nestjs/axios';
import { TimepadClientAuthService } from 'src/client-auth/timepad-client-auth.service';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { GetExternalEventListQueryDto } from '../dto/get-external-event-list-query.dto';
import { TimepadDataDto } from '../dto/timepad-data.dto';
import { DictionariesService } from 'src/dictionaries/dictionaries.service';
import { EventAPISource } from '../enums/event-source.enum';
import { GeoService } from 'src/geo/geo.service';
import { TimepadApiRateLimiterService } from 'src/common/api-utils/timepad-api-limiter.service';
import { TimepadEventMapperService } from './timepad-event-mapper.service';
import { CacheService } from 'src/cache/cache.service';
import { TIMEPAD_EVENT_MIN_AMOUNT } from 'src/common/constants/timepad-request.constant';
import {
  TimepadEventsResponseType,
  TimepadEventType
} from '../types/timepad-events-response.type';

@Injectable()
export class TimepadEventService implements APIEventInterface<TimepadDataDto> {
  private readonly logger = new Logger(TimepadEventService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: TimepadClientAuthService,
    private readonly dictionariesService: DictionariesService,
    private readonly geoService: GeoService,
    private readonly rateLimiter: TimepadApiRateLimiterService,
    private readonly timepadMapper: TimepadEventMapperService,
    private readonly cacheService: CacheService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('TIMEPAD_API_URL');
  }

  async getAll(
    limit: number,
    skip: number,
    query: GetExternalEventListQueryDto,
  ): Promise<TimepadDataDto[]> {
    const params = await this.buildSearchParams(query, limit, skip);

    const response = await this.fetchFromTimepadApi<TimepadEventsResponseType>(
      '/events',
      params,
    );

    const rawEvents = response.values || [];
    const mappedEvents = await Promise.all(
      rawEvents.map(this.timepadMapper.map),
    );

    this.logger.debug('Timepad event list recieved successfully');

    return mappedEvents;
  }


  async getAllWithMeta(query: GetExternalEventListQueryDto) {
    const { limit, page } = query;
    const skip = (page - 1) * limit;

    const params = await this.buildSearchParams(query, limit, skip);

    const response = await this.fetchFromTimepadApi<TimepadEventsResponseType>(
      '/events',
      params
    );

    const rawEvents = response.values || [];
    const mappedEvents = await Promise.all(
      rawEvents.map(this.timepadMapper.map),
    );

    this.logger.debug('Timepad event list with meta recieved successfully');

    const dataWithMeta = {
      data: mappedEvents,
      meta: {
        totalEventsAmount: response.total || 0,
        totalPagesAmount: Math.ceil(response.total / limit) || 0,
        currentPage: page,
      },
    };

    return dataWithMeta;
  }


  async getOne(id: number): Promise<TimepadDataDto | null> {
    const urlPart = `/events/${id}`;

    const rawEvent = await this.fetchFromTimepadApi<TimepadEventType>(urlPart);

    if (!rawEvent) {
      this.logger.log(`Timepad event ${id} not found`);
      throw new NotFoundException(
        `Event with id ${id} not found in source timepad`,
      );
    }

    const normalizedEvent = await this.timepadMapper.map(rawEvent);

    this.logger.debug('Timepad event recieved successfully');

    return normalizedEvent;
  }


  async getAmount(query: GetExternalEventListQueryDto) {
    const { limit, page, ...otherQuery } = query;
    const cacheKey =
      TimepadEventService.name + this.getAmount.name + JSON.stringify(otherQuery);

    const cachedAmount = await this.cacheService.get<number>(cacheKey);
    if (cachedAmount) {
      return cachedAmount;
    }

    const params = await this.buildSearchParams(
      query,
      TIMEPAD_EVENT_MIN_AMOUNT,
    );

    const data = await this.fetchFromTimepadApi<TimepadEventsResponseType>(
      '/events',
      params,
    );

    this.logger.debug('Timepad events amount recieved successfully');
    const amount = data.total || 0;

    this.cacheService.set<number>(cacheKey, amount);
    return amount;
  }


  /**
   * Builds search parameters for querying the Timepad API based on the
   * provided query object.
   *
   * @async
   * @param {GetExternalEventListQueryDto} query - The event list query parameters.
   * @param {number} limit - The maximum number of results to return.
   * @param {number} [skip] - The number of results to skip (for pagination).
   * @returns {Promise<Record<string, any>>} A promise resolving to an object
   * representing the search parameters.
   * @private
   */
  private async buildSearchParams(
    query: GetExternalEventListQueryDto,
    limit: number,
    skip?: number,
  ): Promise<Record<string, any>> {
    const params: Record<string, any> = {
      limit,
      skip,
      sort: 'starts_at',
      keywords: query.search?.split(' ') || [],
      starts_at_min: query.dateFrom,
      starts_at_max: query.dateTo,
    };

    if (query.themes) {
      const themeIds = await this.dictionariesService.findExternalThemeIds(
        query.themes,
        EventAPISource.TIMEPAD,
      );
      if (themeIds.length > 0) {
        params['category_ids'] = themeIds.join(',');
      }
    }

    if (query.cityId) {
      const city = await this.geoService.findCityById(query.cityId);
      if (city?.name) {
        params['cities'] = city.name;
      }
    }

    return params;
  }


  /**
   * Sends a GET request to the Timepad API with optional query parameters,
   * applying rate limiting to control request throughput.
   *
   * Requests are executed through a Bottleneck rate limiter to ensure that
   * outgoing requests conform to configured rate limits.
   *
   * @async
   * @template T
   * @param {string} urlPart - The endpoint path to append to the base URL.
   * @param {object} [params] - Optional query parameters to include in the
   * request.
   * @returns {Promise<T>} The response data of type T from the Timepad API.
   * @throws {HttpException} When the API request fails.
   * @private
   */
  private async fetchFromTimepadApi<T>(
    urlPart: string,
    params?: object,
  ): Promise<T> {
    const url = `${this.baseUrl}${urlPart}`;

    const token = this.authService.apiToken;

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

        this.logger.debug(`Timepad request to ${url} succeeded`);

        return response.data;
      } catch (error) {
        this.logger.warn(
          `Failed to fetch from Timepad URL: ${url}`,
          error?.response?.data || error.message,
        );

        const status =
          error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

        throw new HttpException(
          {
            message: `Timepad request failed for URL: ${url}`,
            details: error?.response?.data || error.message,
          },
          status,
        );
      }
    });
  }
}