import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { LEADER_API_TOKEN_TTL } from 'src/constants/auth.constant';

@Injectable()
export class LeaderClientAuthService implements OnModuleInit {
  private readonly logger = new Logger(LeaderClientAuthService.name);

  private tokensData: LeaderTokenResponse | null = null;
  private tokenExpireTimeout: NodeJS.Timeout | null = null;

  private readonly tokenExpirationTime = LEADER_API_TOKEN_TTL;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  getAuthConfig() {
    return {
      baseURL: this.configService.getOrThrow<string>('LEADER_API_URL'),
      clientId: this.configService.getOrThrow<string>('LEADER_CLIENT_ID'),
      clientSecret: this.configService.getOrThrow<string>(
        'LEADER_CLIENT_SECRET',
      ),
    };
  }

  
  getAccessToken(): string | undefined {
    if (!this.tokensData) {
      this.logger.warn('Leader access token is not available');
      return undefined;
    }

    return this.tokensData.access_token;
  }


  async authenticateClient(): Promise<LeaderTokenResponse> {
    const { baseURL, clientId, clientSecret } = this.getAuthConfig();

    try {
      const response = await firstValueFrom(
        this.httpService.post<LeaderTokenResponse>(`${baseURL}/oauth/token`, {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
        }),
      );

      this.setTokens(response.data);
      this.logger.log(
        'Successfully authenticated into leader-ID and received tokens',
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        'Failed to authenticate leader-ID client',
        error?.response?.data || error.message,
      );

      throw new UnauthorizedException({
        message: 'Authentication failed',
        cause: error,
        description: error?.response?.data || error.message,
      });
    }
  }


  private setTokens(data: LeaderTokenResponse) {
    this.tokensData = data;

    if (this.tokenExpireTimeout) {
      clearTimeout(this.tokenExpireTimeout);
    }

    this.tokenExpireTimeout = setTimeout(() => {
      this.refreshAccessToken();
    }, this.tokenExpirationTime);
  }


  async refreshAccessToken(): Promise<LeaderTokenResponse> {
    if (!this.tokensData?.refresh_token) {
      this.logger.warn('No refresh token available');
      return this.authenticateClient();
    }

    const { baseURL, clientId, clientSecret } = this.getAuthConfig();

    try {
      const response = await firstValueFrom(
        this.httpService.post<LeaderTokenResponse>(`${baseURL}/oauth/token`, {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: this.tokensData.refresh_token,
        }),
      );

      this.setTokens(response.data);
      this.logger.log('Access token refreshed successfully');

      return response.data;
    } catch (error) {
      this.logger.warn(
        'Failed to refresh token, fallback to authenticateLeaderClient',
        error?.response?.data || error.message,
      );

      // TODO: Реализовать обработку ошибок при неудачной повторной авторизации
      return this.authenticateClient();
    }
  }


  async onModuleInit() {
    try {
      await this.authenticateClient();
      this.logger.log('Leader token retrieved on module init');
    } catch (error) {
      this.logger.error(
        'Failed to retrieve leader token on module init',
        error,
      );
      throw new InternalServerErrorException(
        'Failed to initialize authentication service',
      );
    }
  }
}
