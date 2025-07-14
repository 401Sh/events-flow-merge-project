import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventAPISource } from 'src/events/enums/event-source.enum';
import { CallbackDto } from '../dto/callback.dto';
import { OAuthLeaderHelper } from './oauth-leader-helper';

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  private readonly appUrl: string;
  private readonly leaderOAuthUrl: string;
  private readonly timepadOAuthUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly oAuthLeaderHelper: OAuthLeaderHelper,
  ) {
    this.appUrl = this.configService.getOrThrow("APP_BASE_URL");
    this.leaderOAuthUrl = this.configService.getOrThrow("LEADER_OAUTH_URL");
    this.timepadOAuthUrl = this.configService.getOrThrow("TIMEPAD_OAUTH_URL");
  }

  getRedircetUrl(source: EventAPISource) {
    const redirectUrl = `${this.appUrl}/api/v1/oauth/callback/${source}`;
    const encodedRedirectUrl = encodeURIComponent(redirectUrl);

    const urlParts = this.getSourceRedirectUrlParts(source);

    const authUrl = 
      `${urlParts.baseURL}/authorize?client_id=${urlParts.clientId}` + 
      `&redirect_uri=${encodedRedirectUrl}&response_type=${urlParts.type}`;

    this.logger.debug(`${source} authorize redirect url: `, authUrl);
    return authUrl;
  }


  async getLeaderAccessToken(query: CallbackDto) {
    const data = await this.oAuthLeaderHelper.exchangeСode(query.code);

    return data;
  }


  async refreshLeaderToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('refresh token is missing');
    };

    const data = await this.oAuthLeaderHelper.refreshToken(refreshToken);

    return data;
  }


  getSourceRedirectUrlParts(source: EventAPISource) {
    if (source == EventAPISource.LEADER_ID) {
      const clientId = this.configService.getOrThrow<string>('LEADER_CLIENT_ID');
      
      return {
        baseURL: this.leaderOAuthUrl,
        clientId: clientId,
        type: 'code',
      };
    }

    const clientId = this.configService.getOrThrow<string>('LEADER_CLIENT_ID');
    
    return {
      baseURL: this.timepadOAuthUrl,
      clientId: clientId,
      type: 'token',
    };
  }
}
