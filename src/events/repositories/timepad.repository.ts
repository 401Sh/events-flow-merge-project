import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AbstractTimepadRepository } from './abstract-timepad.repository';
import { TimepadData } from '../interfaces/timepad-data.interface';
import { HttpService } from '@nestjs/axios';
import { TimepadClientAuthService } from 'src/auth/client-auth/timepad-client-auth.service';
import { firstValueFrom } from 'rxjs';
import { mapTimepad } from '../api-utils/timepad-map';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TimepadRepository extends AbstractTimepadRepository {
  private readonly logger = new Logger(TimepadRepository.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: TimepadClientAuthService,
  ) {
    super();
  }

  async getAll(limit: number, skip: number): Promise<TimepadData[]> {
    const token = await this.authService.getAccessToken();
    const baseUrl = this.configService.getOrThrow<string>('TIMEPAD_API_URL');
    const url = `${baseUrl}/events?limit=${limit}&skip=${skip}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );

      const rawEvents = response.data.values || [];
      
      const mappedEvents = rawEvents.map(mapTimepad);
      
      this.logger.debug('Timepad event list recieved successfully');

      return mappedEvents;
    } catch (error) {
      this.logger.warn(
        'Failed to get Timepad event list',
        error?.response?.data || error.message
      );

      const status = error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          message: 'Timepad get event list request failed',
          details: error?.response?.data || error.message
        },
        status
      );
    };
  }

  async getOne(id: number): Promise<TimepadData | null> {
    const token = await this.authService.getAccessToken();
    const baseUrl = this.configService.getOrThrow<string>('TIMEPAD_API_URL');
    const url = `${baseUrl}/events/${id}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );

      const rawEvent = response.data || null;
      
      const normalizedEvent = mapTimepad(rawEvent);
      
      this.logger.debug('Timepad event recieved successfully');

      return normalizedEvent;
    } catch (error) {
      this.logger.warn(
        'Failed to get Timepad event',
        error?.response?.data || error.message
      );

      const status = error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          message: 'Timepad get event request failed',
          details: error?.response?.data || error.message
        },
        status
      );
    };
  }

  async getAmount(): Promise<number> {
    const token = await this.authService.getAccessToken();
    const baseUrl = this.configService.getOrThrow<string>('TIMEPAD_API_URL');
    const url = `${baseUrl}/events?limit=1`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );

      const amount = response.data.total || [];
      
      this.logger.debug('Timepad events amount recieved successfully');

      return amount;
    } catch (error) {
      this.logger.warn(
        'Failed to get Timepad events amount',
        error?.response?.data || error.message
      );

      const status = error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          message: 'Timepad events amount get request failed',
          details: error?.response?.data || error.message
        },
        status
      );
    };
  }
}
