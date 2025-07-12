import { Controller, Get, Param, ParseEnumPipe, Query, Res } from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { Response } from 'express';
import { EventAPISource } from 'src/events/enums/event-source.enum';
import { CallbackDto } from '../dto/callback.dto';
import { refreshCookieOptions } from 'src/configs/cookie.config';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly oAuthService: OAuthService) {}

  @Get('redirect/:source')
  oauthRedirect(
    @Res() res: Response,
    @Param('source', new ParseEnumPipe(EventAPISource)) source: EventAPISource,
  ) {
    const url = this.oAuthService.getRedircetUrl(source);
    return res.redirect(url);
  }


  @Get('callback/leaderId')
  async oauthLeaderCallback(
    @Query() query: CallbackDto,
    @Res() res: Response
  ) {
    const result = await this.oAuthService.getLeaderAccessToken(query);
    
    res.cookie('refreshToken', result.refresh_token, refreshCookieOptions);

    return res.json({ 
      accessToken: result.access_token,
      userId: result.user_id,
    });
  }
}
