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
  private readonly baseUrl: string;

  readonly clientId: string;
  readonly clientSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('LEADER_API_URL');
    this.clientId = this.configService.getOrThrow<string>('LEADER_CLIENT_ID');
    this.clientSecret = this.configService.getOrThrow<string>(
      'LEADER_CLIENT_SECRET',
    );
  }


  /**
   * Retrieves the leader's access token.
   *
   * @returns {string|undefined} The access token if available, otherwise
   * undefined.
   */
  getAccessToken(): string | undefined {
    if (!this.tokensData) {
      this.logger.warn('Leader access token is not available');
      return undefined;
    }

    return this.tokensData.access_token;
  }


  /**
   * Authenticates the client using client credentials grant and obtains leader
   * tokens.
   *
   * Sends a POST request to the OAuth token endpoint with client ID and
   * secret, then stores the received tokens.
   *
   * @async
   * @returns {Promise<LeaderTokenResponse>} Resolves with the token response
   * data.
   * @throws {UnauthorizedException} Throws if authentication fails.
   */
  async authenticateClient(): Promise<LeaderTokenResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<LeaderTokenResponse>(
          `${this.baseUrl}/oauth/token`,
          {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'client_credentials',
          },
        ),
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


  /**
   * Stores the leader token data and sets up a timeout to refresh the access
   * token before it expires.
   *
   * @param {LeaderTokenResponse} data - The token response data to be stored.
   * @private
   */
  private setTokens(data: LeaderTokenResponse) {
    this.tokensData = data;

    if (this.tokenExpireTimeout) {
      clearTimeout(this.tokenExpireTimeout);
    }

    this.tokenExpireTimeout = setTimeout(() => {
      this.refreshAccessToken();
    }, this.tokenExpirationTime);
  }


  /**
   * Refreshes the access token using the refresh token.
   *
   * If no refresh token is available, falls back to authenticating the client
   * again.
   *
   * @async
   * @returns {Promise<LeaderTokenResponse>} Resolves with the new token
   * response data.
   */
  async refreshAccessToken(): Promise<LeaderTokenResponse> {
    if (!this.tokensData?.refresh_token) {
      this.logger.warn('No refresh token available');
      return this.authenticateClient();
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<LeaderTokenResponse>(
          `${this.baseUrl}/oauth/token`,
          {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: this.tokensData.refresh_token,
          },
        ),
      );

      this.setTokens(response.data);
      this.logger.log('Access token refreshed successfully');

      return response.data;
    } catch (error) {
      this.logger.warn(
        'Failed to refresh token, fallback to authenticateLeaderClient',
        error?.response?.data || error.message,
      );

      // TODO: Implement error handling for failed re-authorization
      return this.authenticateClient();
    }
  }


  /**
   * Initializes the module by authenticating the client and retrieving the
   * leader token.
   *
   * This method is called during the module initialization phase.
   *
   * @async
   * @throws {InternalServerErrorException} Throws if authentication fails
   * during initialization.
   */
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