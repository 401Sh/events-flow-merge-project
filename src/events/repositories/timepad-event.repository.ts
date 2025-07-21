import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AbstractTimepadEventRepository } from './abstract-timepad-event.repository';
import { HttpService } from '@nestjs/axios';
import { TimepadClientAuthService } from 'src/auth/client-auth/timepad-client-auth.service';
import { firstValueFrom } from 'rxjs';
import { mapTimepad } from '../api-utils/timepad-map';
import { ConfigService } from '@nestjs/config';
import { GetEventListQueryDto } from '../dto/get-event-list-query.dto';
import { TimepadDataDto } from '../dto/timepad-data.dto';
import { DictionariesService } from 'src/dictionaries/dictionaries.service';
import { EventAPISource } from '../enums/event-source.enum';
import { GeoService } from 'src/geo/geo.service';

@Injectable()
export class TimepadEventRepository extends AbstractTimepadEventRepository {
  private readonly logger = new Logger(TimepadEventRepository.name);
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: TimepadClientAuthService,
    private readonly dictionariesService: DictionariesService,
    private readonly geoService: GeoService,
  ) {
    super();
    this.baseUrl = this.configService.getOrThrow<string>('TIMEPAD_API_URL');
  }

  async getAll(
    limit: number,
    skip: number,
    query: GetEventListQueryDto,
  ): Promise<TimepadDataDto[]> {
    const params = await this.buildSearchParams(query, limit, skip);

    const response = await this.fetchFromTimepadApi<{ values: any[] }>(
      '/events',
      params,
    );

    const rawEvents = response.values || [];
    const mappedEvents = rawEvents.map(mapTimepad);

    this.logger.debug('Timepad event list recieved successfully');

    return mappedEvents;
  }


  async getAllWithMeta(query: GetEventListQueryDto) {
    const { limit, page } = query;
    const skip = (page - 1) * limit;

    const params = await this.buildSearchParams(query, limit, skip);

    const response = await this.fetchFromTimepadApi<{
      values: any[];
      total: number;
    }>('/events', params);

    const rawEvents = response.values || [];
    const mappedEvents = rawEvents.map(mapTimepad);

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

    const rawEvent = await this.fetchFromTimepadApi<any>(urlPart);

    if (!rawEvent) {
      this.logger.log(`Timepad event ${id} not found`);
      throw new NotFoundException(
        `Event with id ${id} not found in source timepad`,
      );
    }

    const normalizedEvent = mapTimepad(rawEvent);

    this.logger.debug('Timepad event recieved successfully');

    return normalizedEvent;
  }


  async getAmount(query: GetEventListQueryDto) {
    const params = await this.buildSearchParams(query, 1);

    const data = await this.fetchFromTimepadApi<{ total: number }>(
      '/events',
      params,
    );

    this.logger.debug('Timepad events amount recieved successfully');
    return data.total || 0;
  }


  private async buildSearchParams(
    query: GetEventListQueryDto,
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

  
  private async fetchFromTimepadApi<T>(
    urlPart: string,
    params?: object,
  ): Promise<T> {
    const url = `${this.baseUrl}${urlPart}`;

    const token = this.authService.apiToken;

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
  }
}
