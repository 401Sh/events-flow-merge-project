import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { APIDictionaryInterface } from './api-dictionary.service.interface';
import { TimepadClientAuthService } from 'src/auth/client-auth/timepad-client-auth.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { EventThemesDto } from '../dto/event-themes.dto';

@Injectable()
export class TimepadDictionaryService implements APIDictionaryInterface {
  private readonly logger = new Logger(TimepadDictionaryService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: TimepadClientAuthService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('TIMEPAD_API_URL');
  }

  async getAllThemes(): Promise<EventThemesDto[]> {
    const urlPart = `/dictionary/event_categories`;

    const rawThemes = await this.fetchFromTimepad<{ values: EventThemesDto[] }>(
      urlPart,
    );

    this.logger.debug('Timepad themes recieved successfully');

    return rawThemes.values;
  }

  
  private async fetchFromTimepad<T>(urlPart: string): Promise<T> {
    const url = `${this.baseUrl}${urlPart}`;

    const token = this.authService.apiToken;

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
