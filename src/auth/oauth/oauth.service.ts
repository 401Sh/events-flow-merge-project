import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventAPISource } from 'src/events/enums/event-source.enum';
import { CallbackDto } from '../dto/callback.dto';
import { AbstractLeaderOAuthRepository } from './repositories/abstract-leader-oauth.repository';

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
    private readonly leaderRepository: AbstractLeaderOAuthRepository,
  ) {
    this.appUrl = this.configService.getOrThrow('APP_BASE_URL');

    this.leaderOAuthUrl = this.configService.getOrThrow('LEADER_OAUTH_URL');
    this.leaderClientId =
      this.configService.getOrThrow<string>('LEADER_CLIENT_ID');

    this.timepadOAuthUrl = this.configService.getOrThrow('TIMEPAD_OAUTH_URL');
    this.timepadClientId = this.configService.getOrThrow('TIMEPAD_CLIENT_ID');
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
    const data = await this.leaderRepository.exchangeСode(query.code);

    return data;
  }


  async refreshLeaderToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('refresh token is missing');
    }

    const data = await this.leaderRepository.refreshToken(refreshToken);

    return data;
  }

  
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
