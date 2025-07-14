import { HttpService } from "@nestjs/axios";
import { Logger, UnauthorizedException, HttpStatus, HttpException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { LeaderClientAuthService } from "src/auth/client-auth/leader-client-auth.service";
import { CallbackResultDto } from "src/auth/dto/callback-result.dto";
import { AbstractLeaderOAuthRepository } from "./abstract-leader-oauth.repository";

export class LeaderOAuthRepository extends AbstractLeaderOAuthRepository {
  private readonly logger = new Logger(LeaderOAuthRepository.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: LeaderClientAuthService,
  ) {
    super();
  }

  
  async exchangeСode(code: string): Promise<CallbackResultDto> {
    const urlPart = '/oauth/token';

    const body = {
      client_id: this.authService.clientId,
      client_secret: this.authService.clientSecret,
      grant_type: "authorization_code",
      code: code,
    };

    const data = await this.leaderApiPostRequest<CallbackResultDto>(
      urlPart, 
      body
    );

    this.logger.debug('Received Leader user code exchange response');

    if (!data.user_validated) {
      this.logger.debug('Unauthorized user:', data.user_id);
      throw new UnauthorizedException('Leader ID - unauthorized');
    };

    return data;
  }


  async refreshToken(refreshToken: string) {
    const urlPart = '/oauth/token';

    const body = {
      client_id: this.authService.clientId,
      client_secret: this.authService.clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    };

    const data = await this.leaderApiPostRequest<CallbackResultDto>(
      urlPart, 
      body
    );

    this.logger.debug('Received Leader refresh token response');

    if (!data.user_validated) {
      this.logger.debug('Unauthorized user:', data.user_id);
      throw new UnauthorizedException('Leader ID - unauthorized');
    };

    return data;
  }


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