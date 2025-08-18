import { Module } from '@nestjs/common';
import { ExternalUsersController } from './external-users.controller';
import { ExternalUsersService } from './external-users.service';
import { ClientAuthModule } from 'src/client-auth/client-auth.module';
import { HttpModule } from '@nestjs/axios';
import { LeaderUserService } from './services/leader-user.service';
import { LeaderApiRateLimiterService } from 'src/common/api-utils/leader-api-rate-limiter.service';
import { LeaderVisitedMapperService } from './services/leader-visited-mapper.service';
import { LeaderParticipationService } from './services/leader-participation.service';

@Module({
  imports: [ClientAuthModule, HttpModule],
  controllers: [ExternalUsersController],
  providers: [
    ExternalUsersService,
    LeaderUserService,
    LeaderApiRateLimiterService,
    LeaderVisitedMapperService,
    LeaderParticipationService,
  ],
})
export class ExternalUsersModule {}