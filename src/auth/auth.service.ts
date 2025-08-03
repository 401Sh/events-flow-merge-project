import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshSessionEntity } from './entities/refresh-session.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from 'src/common/constants/jwt-token.constant';
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

  async signUp(
    authDto: AuthDto,
    userAgent: string,
    ip: string,
    fingerprint: string,
  ) {
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


  async signIn(
    authDto: AuthDto,
    userAgent: string,
    ip: string,
    fingerprint: string,
  ) {
    const user = await this.usersService.findByEmail(authDto.email);

    if (!user) throw new BadRequestException('User does not exist');

    if (!fingerprint) {
      fingerprint = await this.generateFingerprint(ip, userAgent);
    };

    const isPasswordValid = await this.verifyData(
      authDto.password,
      user.password,
    );
    if (!isPasswordValid){
      throw new BadRequestException('Password is incorrect');
    };

    const existiingSession = await this.findRefreshSession(
      user.id,
      fingerprint,
    );

    if (existiingSession){
      await this.deleteRefreshSession(user.id, fingerprint);
    };

    const tokens = await this.getTokens(user.id, user.email);
    await this.createRefreshSession(
      user,
      tokens.refreshToken,
      userAgent,
      ip,
      fingerprint
    );
    return tokens;
  }


  async deleteRefreshSession(userId: number, fingerprint: string){
    this.logger.debug(`Deleting user ${userId} session`);
    const deleteResult = await this.refreshSessionRepository.delete({
      user: { id: userId },
      fingerprint: fingerprint
    });

    if (deleteResult.affected === 0) {
      this.logger.debug(`Cannot delete session. No session with user 
        id: ${userId} and fingerprint ${fingerprint}`);
      throw new NotFoundException('Session not found');
    };

    return deleteResult;
  }


  async refreshTokens(
    userId: number,
    refreshToken: string,
    userAgent: string,
    ip: string,
    fingerprint: string,
  ) {
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      this.logger.debug(`No user with id: `, userId);
      throw new BadRequestException('User does not exist');
    };

    if (!fingerprint) {
      fingerprint = await this.generateFingerprint(ip, userAgent);
    };

    // Verifing refresh token
    const session = await this.findRefreshSession(user.id, fingerprint);
    
    if (!session) {
      this.logger.log(`Access denied for user: ${user.id}. No existing session`);
      throw new ForbiddenException('Access Denied');
    };

    // Check if token has expired
    const currentTime = new Date();
    if (session.expiresAt < currentTime) {
      this.logger.log(`Access denied for user: ${user.id}. Refresh token expired`);
      throw new ForbiddenException('Refresh token expired');
    }

    const isTokenValid = await this.verifyData(
      refreshToken,
      session.refreshToken,
    );

    if (!isTokenValid) {
      this.logger.log(`Access denied for user: ${user.id}. Incorrect refresh token`);
      throw new ForbiddenException('Access Denied');
    };

    await this.deleteRefreshSession(user.id, fingerprint);

    // Create new refreshToken session
    const tokens = await this.getTokens(user.id, user.email);
    await this.createRefreshSession(
      user,
      tokens.refreshToken,
      userAgent,
      ip,
      fingerprint,
    );

    this.logger.debug(`Created new jwt tokens for user: `, user.id);
    return tokens;
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
      expiresAt: this.createFutureDate(REFRESH_TOKEN_TTL),
    });

    return session;
  }


  private async generateFingerprint(ip: string, ua: string): Promise<string> {
    const hash = await this.hashData(ip + ua);
    return hash;
  }
  
  
  private hashData(data: string): Promise<string> {
    return argon2.hash(data);
  }


  private verifyData(data: string, hashedData: string): Promise<boolean> {
    return argon2.verify(hashedData, data);
  }


  private createFutureDate(milliseconds: number): Date {
    const now = new Date();
    const futureDate = new Date(now.getTime() + milliseconds);

    return futureDate;
  }


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


  private async findRefreshSession(userId: number, fingerprint: string){
    const session = await this.refreshSessionRepository.findOne(
      { 
        where: {
          user: { id: userId },
          fingerprint: fingerprint,
        }
      }
    );
    
    this.logger.debug(`Finded session for user id: ${userId}`, session);
    return session;
  };
}