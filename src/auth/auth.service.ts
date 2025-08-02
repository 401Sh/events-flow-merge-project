import { Injectable, Logger } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshSessionEntity } from './entities/refresh-session.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from 'src/constants/jwt-token.constant';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  
  constructor(
    @InjectRepository(RefreshSessionEntity)
    private refreshSessionRepository: Repository<RefreshSessionEntity>,

    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    this.accessSecret = this.configService.getOrThrow('JWT_ACCESS_SECRET');
    this.refreshSecret = this.configService.getOrThrow('JWT_REFRESH_SECRET');
  }

  async signUp(authDto: AuthDto, userAgent: string, ip: string, fingerprint: string) {
    const newUser = await this.usersService.create(
      authDto.email,
      authDto.password,
    );

    if (!fingerprint) {
      fingerprint = await this.generateFingerprint(ip, userAgent);
    };

    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.createRefreshSession(
      newUser,
      tokens.refreshToken,
      userAgent,
      ip,
      fingerprint,
    );
    return tokens;
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


  private async createRefreshSession(
    user: UserEntity,
    refreshToken: string,
    userAgent: string,
    ip: string,
    fingerprint: string,
  ) {
    const hashedRefreshToken = await this.hashData(refreshToken);

    const session = await this.refreshSessionRepository.save({
      user,
      refreshToken: hashedRefreshToken,
      userAgent,
      ip,
      fingerprint,
      expiresAt: REFRESH_TOKEN_TTL,
    });

    return session;
  }


  private async generateFingerprint(ip: string, ua: string): Promise<string> {
    const hash = await this.hashData(ip + ua);
    return hash;
  }
  
  
  private hashData(data: string): Promise<string> {
    return argon2.hash(data);
  };


  private async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.accessSecret,
          expiresIn: ACCESS_TOKEN_TTL,
        },
      ),
      
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.refreshSecret,
          expiresIn: REFRESH_TOKEN_TTL,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}