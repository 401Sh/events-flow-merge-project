import { Module } from '@nestjs/common';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';
import { EventsModule } from 'src/events/events.module';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantEntity } from 'src/participants/entities/participant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParticipantEntity]),
    UsersModule,
    EventsModule,
  ],
  controllers: [ParticipantsController],
  providers: [ParticipantsService]
})
export class ParticipantsModule {}