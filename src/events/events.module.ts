import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { ClientAuthModule } from 'src/auth/client-auth/client-auth.module';

@Module({
  imports: [ClientAuthModule],
  controllers: [EventsController],
  providers: [EventsService]
})
export class EventsModule {}
