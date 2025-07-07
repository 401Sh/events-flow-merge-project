import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AbstractTimepadDictionaryRepository } from './abstract-timepad-dictionary.repository';
import { EventThemes } from '../interfaces/event-themes.interface';
import { TimepadClientAuthService } from 'src/auth/client-auth/timepad-client-auth.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TimepadDictionaryRepository extends AbstractTimepadDictionaryRepository {
  private readonly logger = new Logger(TimepadDictionaryRepository.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: TimepadClientAuthService,
  ) {
    super();
  }

  async getAllThemes(): Promise<EventThemes[]> {
    const urlPart = `/dictionary/event_categories`;

    const rawThemes = await this.fetchFromTimepad<{ values: EventThemes[] }>(
      urlPart,
    );

    this.logger.debug('Timepad themes recieved successfully');

    return rawThemes.values;
  }

  
  private async fetchFromTimepad<T>(urlPart: string): Promise<T> {
    const baseUrl = this.configService.getOrThrow<string>('TIMEPAD_API_URL');
    const url = `${baseUrl}${urlPart}`;

    const token = await this.authService.getAccessToken();

    try {
      const response = await firstValueFrom(
        this.httpService.get<T>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
