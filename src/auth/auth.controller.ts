import { Body, Controller, Delete, Headers, Ip, Post, Res, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { refreshCookieOptions } from 'src/common/configs/cookie.config';
import { AuthDto } from './dto/auth.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TokenResultDto } from './dto/token-result.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'Регистрация аккаунта по почте и пароле',
  })
  @ApiBody({
    description: 'Данные для регистрации акаунта',
    type: AuthDto,
    required: true,
  })
  @ApiHeader({
    name: 'user-agent',
    description: 'User-Agent заголовок',
    required: true,
    example: 'Mozilla/5.0',
  })
  @ApiHeader({
    name: 'x-fingerprint',
    description: 'Уникальный отпечаток устройства',
    required: true,
    example: '123456789abcdef',
  })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    type: TokenResultDto,
  })
  @Post('signup')
  async signup(
    @Headers('user-agent') userAgent: string,
    @Headers('x-fingerprint') fingerprint: string,
    @Ip() ip: string,
    @Body() authDto: AuthDto,
    @Res() res: Response,
  ) {
    const tokens = await this.authService.signUp(
      authDto,
      userAgent,
      ip,
      fingerprint,
    );

    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

    return res.json({ accessToken: tokens.accessToken });
  }


  @ApiOperation({
    summary: 'Авторизация пользователя',
  })
  @ApiBody({ 
    description: 'Данные для входа в аккаунт',
    type: AuthDto,
    required: true
  })
  @ApiHeader({
    name: 'user-agent',
    description: 'User-Agent заголовок',
    required: true,
    example: 'Mozilla/5.0'
  })
  @ApiHeader({
    name: 'x-fingerprint',
    description: 'Уникальный отпечаток устройства',
    required: true,
    example: '123456789abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход',
    type: TokenResultDto,
  })
  @Post('signin')
  async signin(
    @Headers('user-agent') userAgent: string,
    @Headers('x-fingerprint') fingerprint: string,
    @Ip() ip: string,
    @Body() authDto: AuthDto,
    @Res() res: Response
  ) {
    const tokens = await this.authService.signIn(
      authDto,
      userAgent,
      ip, 
      fingerprint,
    );

    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

    return res.json({ accessToken: tokens.accessToken });
  }


  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Удаление пользовательской сессии',
  })
  @ApiHeader({
    name: 'x-fingerprint',
    description: 'Уникальный отпечаток устройства',
    required: true,
    example: '123456789abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешный выход',
    type: TokenResultDto,
  })
  @Delete('logout')
  @UseGuards(AccessTokenGuard)
  async logout(
    @Headers('x-fingerprint') fingerprint: string,
    @Request() req,
    @Res() res: Response
  ) {
    const userId = req.user['sub'];

    await this.authService.deleteRefreshSession(userId, fingerprint);

    res.clearCookie('refreshToken', { path: '/' });

    return res.status(200).send({
      message: 'Succesfully logout',
      accessToken: ''
    });
  }


  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Обновление токенов',
  })
  @ApiHeader({
    name: 'user-agent',
    description: 'User-Agent заголовок',
    required: true,
    example: 'Mozilla/5.0',
  })
  @ApiHeader({
    name: 'x-fingerprint',
    description: 'Уникальный отпечаток устройства',
    required: true,
    example: '123456789abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Токены обновлены',
    type: TokenResultDto,
  })
  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refreshTokens(
    @Request() req,
    @Headers('user-agent') userAgent: string,
    @Headers('x-fingerprint') fingerprint: string,
    @Ip() ip: string,
    @Res() res: Response,
  ) {
    const userId = req.user['sub'];
    const refreshToken = req.cookies['refreshToken'];

    const tokens = await this.authService.refreshTokens(
      userId,
      refreshToken,
      userAgent,
      ip,
      fingerprint,
    );

    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

    return res.json({ accessToken: tokens.accessToken });
  }
}