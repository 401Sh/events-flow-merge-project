import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Query,
  Res,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { Response } from 'express';
import { EventAPISource } from 'src/external-events/enums/event-source.enum';
import { CallbackDto } from './dto/callback.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { TokenResponseDto } from './dto/token-response.dto';
import { RefreshBodyDto } from './dto/refresh-body.dto';

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
    status: HttpStatus.FOUND,
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
    summary:
      'callback для обмена code от leaderId на access и refresh токены,' +
      'а также на userId - необходимый для получения данных',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'Код для обмена на токены leaderId',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access токен для доступа к ресурсам на leaderId',
    type: TokenResponseDto,
  })
  @Get('callback/leaderId')
  async oauthLeaderCallback(@Query() query: CallbackDto, @Res() res: Response) {
    const result = await this.oAuthService.getLeaderAccessToken(query);

    return res.json({
      userId: result.user_id,
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
      source: EventAPISource.LEADER_ID,
    });
  }


  @ApiSecurity('ApiKeyAuth')
  @ApiOperation({
    summary:
      'Обновить токены доступа к leaderId. ' +
      'Требуется наличие refresh токена в защищенных куки',
  })
  @ApiBody({
    description: 'Данные для обновления токенов',
    type: RefreshBodyDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Новый access токен для доступа к ресурсам на leaderId',
    type: TokenResponseDto,
  })
  @Post('refresh/leaderId')
  async oauthLeaderRefresh(
    @Body() body: RefreshBodyDto, 
    @Res() res: Response,
  ) {
    const result = await this.oAuthService.refreshLeaderToken(
      body.refreshToken,
    );

    return res.json({
      userId: result.user_id,
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
      source: EventAPISource.LEADER_ID,
    });
  }
}