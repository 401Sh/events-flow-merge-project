import { Module } from '@nestjs/common';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { OAuthLeaderHelper } from './oauth-leader-helper';
import { HttpModule } from '@nestjs/axios';
import { ClientAuthModule } from '../client-auth/client-auth.module';

@Module({
  imports: [ClientAuthModule, HttpModule],
  controllers: [OAuthController],
  providers: [OAuthService, OAuthLeaderHelper],
})
export class OauthModule {}
