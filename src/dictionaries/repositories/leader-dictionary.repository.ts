import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { AbstractLeaderDictionaryRepository } from "./abstract-leader-dictionary.repository";
import { EventThemes } from "../interfaces/event-themes.interface";
import { LeaderClientAuthService } from "src/auth/client-auth/leader-client-auth.service";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

@Injectable()
export class LeaderDictionaryRepository extends AbstractLeaderDictionaryRepository {
  private readonly logger = new Logger(LeaderDictionaryRepository.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: LeaderClientAuthService,
  ) {
    super();
  }

  async getAllThemes(): Promise<EventThemes[]> {
    const urlPart = `/themes`;
      
    const rawThemes = await this.fetchFromLeaderApi<EventThemes[]>(urlPart);
      
    this.logger.debug('Leader themes recieved successfully');

    return rawThemes;
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