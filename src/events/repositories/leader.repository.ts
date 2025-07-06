import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AbstractLeaderRepository } from './abstract-leader.repository';
import { LeaderData } from '../interfaces/leader-data.interface';
import { HttpService } from '@nestjs/axios';
import { mapLeader } from '../api-utils/leader-map';
import { firstValueFrom } from 'rxjs';
import { LeaderClientAuthService } from 'src/auth/client-auth/leader-client-auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LeaderRepository extends AbstractLeaderRepository {
  private readonly logger = new Logger(LeaderRepository.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: LeaderClientAuthService,
  ) {
    super();
  }

  async getAll(limit: number, skip: number): Promise<LeaderData[]> {
    const page = Math.floor(skip / limit) + 1;

    const urlPart = `/events/search?paginationSize=${limit}&paginationPage=${page}`;

    const data = await this.fetchFromLeaderApi<{ items: any[] }>(urlPart);
    const rawEvents = data.items || [];
    const mappedEvents = rawEvents.map(mapLeader);
      
    this.logger.debug('Leader event list recieved successfully');

    return mappedEvents;
  }

  // в актуальном API нет возможности запросить одно событие
  async getOne(id: number): Promise<LeaderData | null> {
    throw new Error('Method not implemented.');
  }

  async getAmount(): Promise<number> {
    const urlPart = `/events/search?paginationSize=2`;

    const data = await this.fetchFromLeaderApi<{ meta: { totalCount: number } }>(urlPart);

    this.logger.debug('Leader events amount recieved successfully');

    return data.meta?.totalCount || 0;
  }


  private async fetchFromLeaderApi<T>(urlPart: string): Promise<T> {
    const baseUrl = this.configService.getOrThrow<string>('LEADER_API_URL');
    const url = `${baseUrl}${urlPart}`;

    const token = await this.authService.getAccessToken();

    try {
      const response = await firstValueFrom(
        this.httpService.get<T>(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );

      this.logger.debug(`Leader API request to ${url} succeeded`);

      return response.data;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch from Leader API URL: ${url}`,
        error?.response?.data || error.message
      );

      const status = error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          message: `Leader API request failed for URL: ${url}`,
          details: error?.response?.data || error.message
        },
        status
      );
    }
  }
}
