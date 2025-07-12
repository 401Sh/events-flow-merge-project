import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventAPISource } from 'src/events/enums/event-source.enum';
import { CallbackDto } from '../dto/callback.dto';
import { OAuthLeaderHelper } from './oauth-leader-helper';

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly oAuthLeaderHelper: OAuthLeaderHelper,
  ) {}

  getRedircetUrl(source: EventAPISource) {
    // TODO: вынести редирект в конфиг или env и заменить на реальное значение
    const redirectUrl = `http://localhost:3000/oauth/callback/${source}`;
    const encodedRedirectUrl = encodeURIComponent(redirectUrl);

    const urlParts = this.getSourceRedirectUrlParts(source);

    const authUrl = 
      `${urlParts.baseURL}authorize?client_id=${urlParts.clientId}` + 
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
      // TODO: привести все leader url к одному виду? (проблема в /apps/v1 и /apps)
      const baseURL = 'https://leader-id.ru/apps/';
      const clientId = this.configService.getOrThrow<string>('LEADER_CLIENT_ID');
      
      return {
        baseURL: baseURL,
        clientId: clientId,
        type: 'code',
      };
    }
    
    // TODO: привести все timepad url к одному виду? (проблема в /v1 и /oauth)
    // oauth timepad в закрытом тестировании (12.07.2025)
    const baseURL = 'https://api.timepad.ru/oauth/';
    const clientId = this.configService.getOrThrow<string>('LEADER_CLIENT_ID');
    
    return {
      baseURL: baseURL,
      clientId: clientId,
      type: 'token',
    };
  }
}
