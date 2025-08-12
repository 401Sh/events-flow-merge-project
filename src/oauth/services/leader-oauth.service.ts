import { HttpService } from '@nestjs/axios';
import {
  Logger,
  UnauthorizedException,
  HttpStatus,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { LeaderClientAuthService } from 'src/client-auth/leader-client-auth.service';
import { APIOAuthInterface } from './api-oauth.service.interface';
import { LeaderApiRateLimiterService } from 'src/common/api-utils/leader-api-rate-limiter.service';
import { LeaderTokenResponse } from '../interfaces/leader-token-response.interface';

@Injectable()
export class LeaderOAuthService
  implements APIOAuthInterface<LeaderTokenResponse>
{
  private readonly logger = new Logger(LeaderOAuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: LeaderClientAuthService,
    private readonly rateLimiter: LeaderApiRateLimiterService,
  ) {}


  async exchangeСode(code: string) {
    const urlPart = '/oauth/token';

    const body = {
      client_id: this.authService.clientId,
      client_secret: this.authService.clientSecret,
      grant_type: 'authorization_code',
      code: code,
    };

    const data = await this.leaderApiPostRequest<LeaderTokenResponse>(
      urlPart,
      body,
    );

    this.logger.debug('Received Leader user code exchange response');

    if (!data.user_validated) {
      this.logger.debug(`Unauthorized user: ${data.user_id}`);
      throw new UnauthorizedException('Leader ID - unauthorized');
    }

    return data;
  }


  async refreshToken(refreshToken: string) {
    const urlPart = '/oauth/token';

    const body = {
      client_id: this.authService.clientId,
      client_secret: this.authService.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    const data = await this.leaderApiPostRequest<LeaderTokenResponse>(
      urlPart,
      body,
    );

    this.logger.debug('Received Leader refresh token response');

    if (!data.user_validated) {
      this.logger.debug(`Unauthorized user: ${data.user_id}`);
      throw new UnauthorizedException('Leader ID - unauthorized');
    }

    return data;
  }


  /**
   * Sends a POST request to the Leader API with the specified URL path and
   * optional body, applying rate limiting to control request throughput.
   *
   * Requests are executed through a Bottleneck rate limiter to ensure that
   * outgoing requests conform to configured rate limits.
   *
   * @template T - The expected response data type.
   * @param {string} urlPart - The URL path to append to the base Leader API URL.
   * @param {object} [body] - Optional request payload to send.
   * @returns {Promise<T>} The response data from the Leader API.
   * @throws {HttpException} Throws if the HTTP request fails.
   * @private
   */
  private async leaderApiPostRequest<T>(
    urlPart: string,
    body?: object,
  ): Promise<T> {
    const baseUrl = this.configService.getOrThrow<string>('LEADER_API_URL');
    const url = `${baseUrl}${urlPart}`;

    return this.rateLimiter.schedule(async () => {
      try {
        const response = await firstValueFrom(
          this.httpService.post<T>(url, body, {
            headers: {
              'Content-Type': 'application/json',
            },
          }),
        );

        this.logger.debug(`Leader API POST request to ${url} succeeded`);

        return response.data;
      } catch (error) {
        this.logger.warn(
          `Failed to POST to Leader API URL: ${url}`,
          error?.response?.data || error.message,
        );

        const status =
          error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

        throw new HttpException(
          {
            message: `Leader API POST request failed for URL: ${url}`,
            details: error?.response?.data || error.message,
          },
          status,
        );
      }
    });
  }
}