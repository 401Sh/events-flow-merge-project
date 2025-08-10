import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
import { UsersModule } from 'src/users/users.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity]),
    UsersModule,
    StorageModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}