import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { LeaderUserService } from './services/leader-user.service';
import { ClientAuthModule } from 'src/auth/client-auth/client-auth.module';
import { HttpModule } from '@nestjs/axios';
import { LeaderApiRateLimiterService } from 'src/api-utils/leader-api-rate-limiter.service';

@Module({
  imports: [ClientAuthModule, HttpModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    LeaderUserService,
    LeaderApiRateLimiterService,
  ],
})
export class UsersModule {}