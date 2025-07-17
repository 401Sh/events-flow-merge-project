import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { ClientAuthModule } from 'src/auth/client-auth/client-auth.module';
import { AbstractLeaderEventRepository } from './repositories/abstract-leader-event.repository';
import { AbstractTimepadEventRepository } from './repositories/abstract-timepad-event.repository';
import { LeaderEventRepository } from './repositories/leader-event.repository';
import { TimepadEventRepository } from './repositories/timepad-event.repository';
import { HttpModule } from '@nestjs/axios';
import { DictionariesModule } from 'src/dictionaries/dictionaries.module';
import { GeoModule } from 'src/geo/geo.module';

@Module({
  imports: [ClientAuthModule, HttpModule, DictionariesModule, GeoModule],
  controllers: [EventsController],
  providers: [
    EventsService,
    { provide: AbstractLeaderEventRepository, useClass: LeaderEventRepository },
    {
      provide: AbstractTimepadEventRepository,
      useClass: TimepadEventRepository,
    },
  ],
})
export class EventsModule {}
