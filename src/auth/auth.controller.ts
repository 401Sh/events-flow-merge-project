import { Body, Controller, Delete, Headers, Ip, Post, Res, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { refreshCookieOptions } from 'src/common/configs/cookie.config';
import { AuthDto } from './dto/auth.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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


  @UseGuards(AccessTokenGuard)
  @Delete('logout')
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


  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
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