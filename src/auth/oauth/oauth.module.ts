import { Module } from '@nestjs/common';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { HttpModule } from '@nestjs/axios';
import { ClientAuthModule } from '../client-auth/client-auth.module';
import { AbstractLeaderOAuthRepository } from './repositories/abstract-leader-oauth.repository';
import { LeaderOAuthRepository } from './repositories/leader-oauth.repository';

@Module({
  imports: [ClientAuthModule, HttpModule],
  controllers: [OAuthController],
  providers: [
    OAuthService,
    { 
      provide: AbstractLeaderOAuthRepository, 
      useClass: LeaderOAuthRepository 
    },
  ],
})
export class OauthModule {}
