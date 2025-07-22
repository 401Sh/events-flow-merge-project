import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { LeaderUserRepository } from './repositories/leader-user.repository';
import { AbstractLeaderUserRepository } from './repositories/abstract-leader-user.repository';
import { ClientAuthModule } from 'src/auth/client-auth/client-auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ClientAuthModule,
    HttpModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: AbstractLeaderUserRepository,
      useClass: LeaderUserRepository,
    },
  ],
})
export class UsersModule {}
