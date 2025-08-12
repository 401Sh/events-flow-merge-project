import { Module } from '@nestjs/common';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { HttpModule } from '@nestjs/axios';
import { LeaderOAuthService } from './services/leader-oauth.service';
import { LeaderApiRateLimiterService } from 'src/common/api-utils/leader-api-rate-limiter.service';
import { ClientAuthModule } from 'src/client-auth/client-auth.module';

@Module({
  imports: [ClientAuthModule, HttpModule],
  controllers: [OAuthController],
  providers: [OAuthService, LeaderOAuthService, LeaderApiRateLimiterService],
})
export class OauthModule {}