import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { ClientAuthModule } from 'src/auth/client-auth/client-auth.module';
import { LeaderEventService } from './services/leader-event.service';
import { TimepadEventService } from './services/timepad-event.service';
import { HttpModule } from '@nestjs/axios';
import { DictionariesModule } from 'src/dictionaries/dictionaries.module';
import { GeoModule } from 'src/geo/geo.module';

@Module({
  imports: [ClientAuthModule, HttpModule, DictionariesModule, GeoModule],
  controllers: [EventsController],
  providers: [EventsService, LeaderEventService, TimepadEventService],
})
export class EventsModule {}