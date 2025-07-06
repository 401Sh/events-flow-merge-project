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
    const urlPart = `/events?limit=${limit}&skip=${skip}`;

    const data = await this.fetchFromTimepad<{ values: any[] }>(urlPart);
    const rawEvents = data.values || [];
    const mappedEvents = rawEvents.map(mapTimepad);
      
    this.logger.debug('Timepad event list recieved successfully');

    return mappedEvents
  }


  async getAllWithMeta(limit: number, page: number) {
    const skip = (page - 1) * limit;
    const urlPart = `/events?limit=${limit}&skip=${skip}`;

    const data = await this.fetchFromTimepad<{ values: any[], total: number }>(urlPart);
    const rawEvents = data.values || [];
    const mappedEvents = rawEvents.map(mapTimepad);
    
    this.logger.debug('Timepad event list with meta recieved successfully');

    const dataWithMeta = {
      data: mappedEvents,
      meta: {
        totalEventsAmount: data.total || 0,
        totalPagesAmount: Math.ceil(data.total / limit) || 0,
        currentPage: page
      }
    }

    return dataWithMeta
  }

  
  async getOne(id: number): Promise<TimepadData | null> {
    const urlPart = `/events/${id}`;
      
    const rawEvent = await this.fetchFromTimepad<any>(urlPart);
    const normalizedEvent = rawEvent ? mapTimepad(rawEvent) : null;
      
    this.logger.debug('Timepad event recieved successfully');

    return normalizedEvent;
  }


  async getAmount(): Promise<number> {
    const urlPart = `/events?limit=1`;
      
    const data = await this.fetchFromTimepad<{ total: number }>(urlPart);
    
    this.logger.debug('Timepad events amount recieved successfully');
    return data.total || 0;
  }


  private async fetchFromTimepad<T>(urlPart: string): Promise<T> {
    const baseUrl = this.configService.getOrThrow<string>('TIMEPAD_API_URL');
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
  
      this.logger.debug(`Timepad request to ${url} succeeded`);
  
      return response.data;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch from Timepad URL: ${url}`,
        error?.response?.data || error.message
      );
  
      const status = error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
  
      throw new HttpException(
        {
          message: `Timepad request failed for URL: ${url}`,
          details: error?.response?.data || error.message
        },
        status
      );
    }
  }
  
}
