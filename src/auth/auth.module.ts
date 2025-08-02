import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { RefreshSessionEntity } from './entities/refresh-session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([RefreshSessionEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ]
})
export class AuthModule {}