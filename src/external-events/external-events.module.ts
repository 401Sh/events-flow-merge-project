import { Module } from '@nestjs/common';
import { ExternalEventsController } from './external-events.controller';
import { ExternalEventsService } from './external-events.service';
import { LeaderEventService } from './services/leader-event.service';
import { TimepadEventService } from './services/timepad-event.service';
import { LeaderApiRateLimiterService } from 'src/common/api-utils/leader-api-rate-limiter.service';
import { TimepadApiRateLimiterService } from 'src/common/api-utils/timepad-api-limiter.service';
import { HttpModule } from '@nestjs/axios';
import { ClientAuthModule } from 'src/client-auth/client-auth.module';
import { DictionariesModule } from 'src/dictionaries/dictionaries.module';
import { GeoModule } from 'src/geo/geo.module';
import { LeaderMapperService } from './services/leader-mapper.service';
import { TimepadMapperService } from './services/timepad-mapper.service';

@Module({
  imports: [ClientAuthModule, HttpModule, DictionariesModule, GeoModule],
  controllers: [ExternalEventsController],
  providers: [
    ExternalEventsService,
    LeaderEventService,
    TimepadEventService,
    LeaderApiRateLimiterService,
    TimepadApiRateLimiterService,
    LeaderMapperService,
    TimepadMapperService,
  ],
})
export class ExternalEventsModule {}