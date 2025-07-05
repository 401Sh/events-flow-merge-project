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

    const token = this.authService.getAccessToken();
    const baseUrl = this.configService.getOrThrow<string>('LEADER_API_URL')
    const url = `${baseUrl}/events/search?paginationSize=${limit}&paginationPage=${page}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );

      const rawEvents = response.data.items || [];
      
      const mappedEvents = rawEvents.map(mapLeader);
      
      this.logger.debug('Leader event list recieved successfully');

      return mappedEvents;
    } catch (error) {
      this.logger.warn(
        'Failed to get Leader event list',
        error?.response?.data || error.message,
      );

      const status = error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          message: 'Leader get request failed',
          details: error?.response?.data || error.message,
        },
        status
      );
    };
  }

  async getOne(id: number): Promise<LeaderData | undefined> {
    return undefined;
  }

  async getAmount(): Promise<number> {
    const token = this.authService.getAccessToken();
    const baseUrl = this.configService.getOrThrow<string>('LEADER_API_URL')
    const url = `${baseUrl}/events/search?paginationSize=2`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );

      const amount = response.data.meta.totalCount || [];
      
      this.logger.debug('Leader events amount recieved successfully');

      return amount;
    } catch (error) {
      this.logger.warn(
        'Failed to get Leader events amount',
        error?.response?.data || error.message,
      );

      const status = error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          message: 'Leader events amount get request failed',
          details: error?.response?.data || error.message,
        },
        status
      );
    };
  }
}
