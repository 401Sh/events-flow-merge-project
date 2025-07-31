import { Module } from '@nestjs/common';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { HttpModule } from '@nestjs/axios';
import { ClientAuthModule } from '../client-auth/client-auth.module';
import { LeaderOAuthService } from './services/leader-oauth.service';
import { LeaderApiRateLimiterService } from 'src/api-utils/leader-api-rate-limiter.service';

@Module({
  imports: [ClientAuthModule, HttpModule],
  controllers: [OAuthController],
  providers: [
    OAuthService,
    LeaderOAuthService,
    LeaderApiRateLimiterService,
  ],
})
export class OauthModule {}