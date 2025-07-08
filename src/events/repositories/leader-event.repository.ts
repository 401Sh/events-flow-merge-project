import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AbstractLeaderEventRepository } from './abstract-leader-event.repository';
import { LeaderData } from '../interfaces/leader-data.interface';
import { HttpService } from '@nestjs/axios';
import { mapLeader } from '../api-utils/leader-map';
import { firstValueFrom } from 'rxjs';
import { LeaderClientAuthService } from 'src/auth/client-auth/leader-client-auth.service';
import { ConfigService } from '@nestjs/config';
import { GetEventListQueryDto } from '../dto/get-event-list-query.dto';

@Injectable()
export class LeaderEventRepository extends AbstractLeaderEventRepository {
  private readonly logger = new Logger(LeaderEventRepository.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: LeaderClientAuthService,
  ) {
    super();
  }

  async getAll(
    limit: number,
    skip: number,
    query: GetEventListQueryDto,
  ): Promise<LeaderData[]> {
    const page = Math.floor(skip / limit) + 1;
    const urlPart = '/events/search';
    const params = {
      paginationSize: limit,
      paginationPage: page,
      sort: 'date',
      query: query.search,
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
    const { limit = 4, page = 1 } = query;

    const urlPart = '/events/search';
    const params = {
      paginationSize: limit,
      paginationPage: page,
      sort: 'date',
      query: query.search,
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


  // в актуальном API нет возможности запросить одно событие
  async getOne(id: number): Promise<LeaderData | null> {
    throw new Error('Method not implemented.');
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
    const baseUrl = this.configService.getOrThrow<string>('LEADER_API_URL');
    const url = `${baseUrl}${urlPart}`;

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
