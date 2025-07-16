import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AbstractLeaderEventRepository } from './abstract-leader-event.repository';
import { HttpService } from '@nestjs/axios';
import { mapLeader } from '../api-utils/leader-map';
import { firstValueFrom } from 'rxjs';
import { LeaderClientAuthService } from 'src/auth/client-auth/leader-client-auth.service';
import { ConfigService } from '@nestjs/config';
import { GetEventListQueryDto } from '../dto/get-event-list-query.dto';
import { LeaderDataDto } from '../dto/leader-data.dto';
import { DictionariesService } from 'src/dictionaries/dictionaries.service';
import { EventAPISource } from '../enums/event-source.enum';
import { GeoService } from 'src/geo/geo.service';

@Injectable()
export class LeaderEventRepository extends AbstractLeaderEventRepository {
  private readonly logger = new Logger(LeaderEventRepository.name);
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: LeaderClientAuthService,
    private readonly dictionariesService: DictionariesService,
    private readonly geoService: GeoService,
  ) {
    super();
    this.baseUrl = this.configService.getOrThrow('LEADER_API_URL')
  }

  async getAll(
    limit: number,
    skip: number,
    query: GetEventListQueryDto,
  ): Promise<LeaderDataDto[]> {
    const page = Math.floor(skip / limit) + 1;
    const urlPart = '/events/search';
    const params = {
      paginationSize: limit,
      paginationPage: page,
      sort: 'date',
      query: query.search,
    };

    if (query.themes) {
      const timepadThemes = await this.dictionariesService.getExternalThemeIds(
        query.themes, 
        EventAPISource.LEADER_ID
      );

      params['themeIds[]'] = timepadThemes;
    };

    if (query.cityId) {
      const city = await this.geoService.findCityById(query.cityId);

      // TODO: Убрать вложенное ветвление
      if (city) {
        const leaderCities = await this.fetchFromLeaderApi<{ data: any }>(
          '/cities/search',
          {
            q: city.name
          },
        );

        // TODO: Срочно убрать вложенное ветвление
        if (leaderCities.data.length != 0) {
          params['cityId'] = leaderCities.data[0].id;
        };
      };
    };

    const data = await this.fetchFromLeaderApi<{ items: any[] }>(
      urlPart,
      params,
    );
    const rawEvents = data.items || [];
    const mappedEvents = rawEvents.map(mapLeader);

    this.logger.debug('Leader event list recieved successfully');

    return mappedEvents;
  }


  async getAllWithMeta(query: GetEventListQueryDto) {
    const { limit, page } = query;

    const urlPart = '/events/search';
    const params = {
      paginationSize: limit,
      paginationPage: page,
      sort: 'date',
      query: query.search,
    };

    if (query.themes) {
      const timepadThemes = await this.dictionariesService.getExternalThemeIds(
        query.themes, 
        EventAPISource.LEADER_ID
      );

      params['themeIds[]'] = timepadThemes;
    };

    if (query.cityId) {
      const city = await this.geoService.findCityById(query.cityId);

      // TODO: Убрать вложенное ветвление
      if (city) {
        const leaderCities = await this.fetchFromLeaderApi<{ data: any }>(
          '/cities/search',
          {
            q: city.name
          },
        );

        // TODO: Срочно убрать вложенное ветвление
        if (leaderCities.data.length != 0) {
          params['cityId'] = leaderCities.data[0].id;
        };
      };
    };

    type LeaderResponseType = {
      items: any[];
      meta: {
        totalCount: number;
        paginationPageCount: number;
      };
    };

    const data = await this.fetchFromLeaderApi<LeaderResponseType>(
      urlPart,
      params,
    );
    const rawEvents = data.items || [];
    const mappedEvents = rawEvents.map(mapLeader);

    this.logger.debug('Leader event list recieved successfully');

    const dataWithMeta = {
      data: mappedEvents,
      meta: {
        totalEventsAmount: data.meta.totalCount,
        totalPagesAmount: data.meta.paginationPageCount,
        currentPage: page,
      },
    };

    return dataWithMeta;
  }


  async getOne(id: number): Promise<LeaderDataDto | null> {
    const urlPart = `/events/search`;
    const params = {
      paginationSize: 2,
      paginationPage: 1,
      query: id,
    };

    const dataResponce = await this.fetchFromLeaderApi<{ items: any[] }>(
      urlPart, 
      params
    );
    
    if (!dataResponce.items || dataResponce.items.length == 0) {
      this.logger.log(`Leader event ${id} not found`);
      throw new NotFoundException(
        `Event with id ${id} not found in source leaderId`,
      );
    };

    const normalizedEvent = mapLeader(dataResponce.items[0]);

    this.logger.debug('Leader event recieved successfully');

    return normalizedEvent;
  }


  async getAmount(): Promise<number> {
    const urlPart = '/events/search';
    const params = { paginationSize: 2 };

    const data = await this.fetchFromLeaderApi<{
      meta: { totalCount: number };
    }>(urlPart, params);

    this.logger.debug('Leader events amount recieved successfully');

    return data.meta?.totalCount || 0;
  }

  
  private async fetchFromLeaderApi<T>(
    urlPart: string,
    params?: object,
  ): Promise<T> {
    const url = `${this.baseUrl}${urlPart}`;

    const token = await this.authService.getAccessToken();

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
  }
}
