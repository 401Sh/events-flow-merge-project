import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Query,
  Res,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { Response } from 'express';
import { EventAPISource } from 'src/events/enums/event-source.enum';
import { CallbackDto } from '../dto/callback.dto';
import { refreshCookieOptions } from 'src/configs/cookie.config';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { TokenResponseDto } from '../dto/token-response.dto';
import { LeaderRefreshTokenGuard } from './guards/leader-refresh-token.guard';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly oAuthService: OAuthService) {}

  @ApiOperation({
    summary: 'Получить редирект url на leaderId или timepad',
  })
  @ApiParam({
    name: 'source',
    required: true,
    description: 'Источник мероприятий: leaderId или timepad',
    example: 'leaderId',
  })
  @ApiResponse({
    status: 302,
    description: 'Редирект на страницу авторизации leaderId или timepad',
  })
  @Get('redirect/:source')
  oauthRedirect(
    @Res() res: Response,
    @Param('source', new ParseEnumPipe(EventAPISource)) source: EventAPISource,
  ) {
    const url = this.oAuthService.getRedircetUrl(source);
    return res.redirect(url);
  }


  @ApiOperation({
    summary: 'callback для обмена code от leaderId на access и refresh токены,' +
             'а также на userId - необходимый для получения данных',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'Код для обмена на токены leaderId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Access токен для доступа к ресурсам на leaderId',
    type: TokenResponseDto,
  })
  @Get('callback/leaderId')
  async oauthLeaderCallback(@Query() query: CallbackDto, @Res() res: Response) {
    const result = await this.oAuthService.getLeaderAccessToken(query);

    res.cookie('leaderIdRefreshToken', result.refresh_token, refreshCookieOptions);

    return res.json({
      userId: result.user_id,
      accessToken: result.access_token,
      source: EventAPISource.LEADER_ID,
    });
  }

  
  @ApiOperation({
    summary:
      'Обновить токены доступа к leaderId. ' +
      'Требуется наличие refresh токена в защищенных куки',
  })
  @ApiResponse({
    status: 200,
    description: 'Новый access токен для доступа к ресурсам на leaderId',
    type: TokenResponseDto,
  })
  @ApiCookieAuth('refreshToken')
  @Post('refresh/leaderId')
  @UseGuards(LeaderRefreshTokenGuard)
  async oauthLeaderRefresh(@Request() req, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    const result = await this.oAuthService.refreshLeaderToken(refreshToken);

    res.cookie('leaderIdRefreshToken', result.refresh_token, refreshCookieOptions);

    return res.json({
      userId: result.user_id,
      accessToken: result.access_token,
      source: EventAPISource.LEADER_ID,
    });
  }
}
