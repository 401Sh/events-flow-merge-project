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
import { LeaderClientAuthService } from 'src/auth/client-auth/leader-client-auth.service';
import { CallbackResultDto } from 'src/auth/dto/callback-result.dto';
import { APIOAuthInterface } from './api-oauth.service.interface';

@Injectable()
export class LeaderOAuthService implements APIOAuthInterface {
  private readonly logger = new Logger(LeaderOAuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: LeaderClientAuthService,
  ) {}


  /**
   * Exchanges an authorization code for an access token and
   *  user data.
   *
   * Sends a POST request to the leader API token endpoint with 
   * the authorization code.
   *
   * @async
   * @param {string} code - The authorization code to exchange.
   * @returns {Promise<CallbackResultDto>} The result data 
   * including access token and user validation info.
   * @throws {UnauthorizedException} Throws if the user is not 
   * validated.
   */
  async exchangeСode(code: string): Promise<CallbackResultDto> {
    const urlPart = '/oauth/token';

    const body = {
      client_id: this.authService.clientId,
      client_secret: this.authService.clientSecret,
      grant_type: 'authorization_code',
      code: code,
    };

    const data = await this.leaderApiPostRequest<CallbackResultDto>(
      urlPart,
      body,
    );

    this.logger.debug('Received Leader user code exchange response');

    if (!data.user_validated) {
      this.logger.debug('Unauthorized user:', data.user_id);
      throw new UnauthorizedException('Leader ID - unauthorized');
    }

    return data;
  }


  /**
   * Refreshes the access token using the provided refresh 
   * token.
   *
   * Sends a POST request to the leader API token endpoint 
   * with the refresh token.
   *
   * @async
   * @param {string} refreshToken - The refresh token used 
   * to obtain a new access token.
   * @returns {Promise<CallbackResultDto>} The result data 
   * including new tokens and user validation info.
   * @throws {UnauthorizedException} Throws if the user is 
   * not validated.
   */
  async refreshToken(refreshToken: string) {
    const urlPart = '/oauth/token';

    const body = {
      client_id: this.authService.clientId,
      client_secret: this.authService.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    const data = await this.leaderApiPostRequest<CallbackResultDto>(
      urlPart,
      body,
    );

    this.logger.debug('Received Leader refresh token response');

    if (!data.user_validated) {
      this.logger.debug('Unauthorized user:', data.user_id);
      throw new UnauthorizedException('Leader ID - unauthorized');
    }

    return data;
  }

  
  /**
   * Sends a POST request to the Leader API with the specified 
   * URL path and optional body.
   *
   * @template T - The expected response data type.
   * @param {string} urlPart - The URL path to append to the 
   * base Leader API URL.
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
  }
}
