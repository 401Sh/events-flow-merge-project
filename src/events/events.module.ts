import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { ClientAuthModule } from 'src/auth/client-auth/client-auth.module';
import { AbstractLeaderRepository } from './repositories/abstract-leader.repository';
import { AbstractTimepadRepository } from './repositories/abstract-timepad.repository';
import { LeaderRepository } from './repositories/leader.repository';
import { TimepadRepository } from './repositories/timepad.repository';

@Module({
  imports: [ClientAuthModule],
  controllers: [EventsController],
  providers: [
    EventsService,
    { provide: AbstractLeaderRepository, useClass: LeaderRepository },
    { provide: AbstractTimepadRepository, useClass: TimepadRepository },
  ]
})
export class EventsModule {}
