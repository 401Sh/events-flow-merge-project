import { Module } from '@nestjs/common';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { HttpModule } from '@nestjs/axios';
import { ClientAuthModule } from '../client-auth/client-auth.module';
import { LeaderOAuthService } from './services/leader-oauth.service';

@Module({
  imports: [ClientAuthModule, HttpModule],
  controllers: [OAuthController],
  providers: [OAuthService, LeaderOAuthService],
})
export class OauthModule {}