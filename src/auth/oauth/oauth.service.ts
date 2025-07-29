import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventAPISource } from 'src/events/enums/event-source.enum';
import { CallbackDto } from '../dto/callback.dto';
import { LeaderOAuthService } from './services/leader-oauth.service';

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  private readonly appUrl: string;
  private readonly leaderOAuthUrl: string;
  private readonly leaderClientId: string;

  private readonly timepadOAuthUrl: string;
  private readonly timepadClientId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly leaderService: LeaderOAuthService,
  ) {
    this.appUrl = this.configService.getOrThrow('APP_BASE_URL');

    this.leaderOAuthUrl = this.configService.getOrThrow('LEADER_OAUTH_URL');
    this.leaderClientId =
      this.configService.getOrThrow<string>('LEADER_CLIENT_ID');

    this.timepadOAuthUrl = this.configService.getOrThrow('TIMEPAD_OAUTH_URL');
    this.timepadClientId = this.configService.getOrThrow('TIMEPAD_CLIENT_ID');
  }

  /**
   * Constructs the OAuth authorization redirect URL for a given event API 
   * source.
   *
   * @param {EventAPISource} source - The source for which to generate the 
   * redirect URL.
   * @returns {string} The constructed OAuth authorization redirect URL.
   */
  getRedircetUrl(source: EventAPISource): string {
    const redirectUrl = `${this.appUrl}/api/v1/oauth/callback/${source}`;
    const encodedRedirectUrl = encodeURIComponent(redirectUrl);

    const urlParts = this.getSourceRedirectUrlParts(source);

    const authUrl =
      `${urlParts.baseURL}/authorize?client_id=${urlParts.clientId}` +
      `&redirect_uri=${encodedRedirectUrl}&response_type=${urlParts.type}`;

    this.logger.debug(`${source} authorize redirect url: `, authUrl);
    return authUrl;
  }


  /**
   * Exchanges an authorization code for a leader access token.
   *
   * @async
   * @param {CallbackDto} query - The callback query containing the 
   * authorization code.
   * @returns {Promise<CallbackResultDto>} A promise that resolves to data 
   * containing the leader access token.
   */
  async getLeaderAccessToken(query: CallbackDto) {
    const data = await this.leaderService.exchangeСode(query.code);

    return data;
  }


  /**
   * Refreshes the leader access token using the provided refresh token.
   *
   * @async
   * @param {string} refreshToken - The refresh token used to obtain a new 
   * access token.
   * @throws {UnauthorizedException} Throws if the refresh token is missing.
   * @returns {Promise<CallbackResultDto>} A promise that resolves to new token 
   * data returned from the leader service.
   */
  async refreshLeaderToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('refresh token is missing');
    }

    const data = await this.leaderService.refreshToken(refreshToken);

    return data;
  }

  
  /**
   * Returns the OAuth redirect URL components based on the given event API 
   * source.
   *
   * @param {EventAPISource} source - The event API source to determine URL 
   * parts for.
   * @returns {{ baseURL: string; clientId: string; type: string }} An object 
   * containing the base URL, client ID, and response type for the OAuth flow.
   * @private
   */
  private getSourceRedirectUrlParts(source: EventAPISource) {
    if (source == EventAPISource.LEADER_ID) {
      return {
        baseURL: this.leaderOAuthUrl,
        clientId: this.leaderClientId,
        type: 'code',
      };
    }

    return {
      baseURL: this.timepadOAuthUrl,
      clientId: this.timepadClientId,
      type: 'token',
    };
  }
}
