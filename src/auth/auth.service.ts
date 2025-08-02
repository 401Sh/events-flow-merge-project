import { Injectable } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  signUp(authDto: AuthDto, userAgent: string, ip: string, fingerprint: string) {
    throw new Error('Method not implemented.');
  }


  signIn(authDto: AuthDto, userAgent: string, ip: string, fingerprint: string) {
    throw new Error('Method not implemented.');
  }


  deleteRefreshSession(userId: any, fingerprint: string) {
    throw new Error('Method not implemented.');
  }


  refreshTokens(userId: any, refreshToken: any, userAgent: string, ip: string, fingerprint: string) {
    throw new Error('Method not implemented.');
  }
}