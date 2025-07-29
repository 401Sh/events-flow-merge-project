import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { LeaderUserService } from './services/leader-user.service';
import { ClientAuthModule } from 'src/auth/client-auth/client-auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ClientAuthModule, HttpModule],
  controllers: [UsersController],
  providers: [UsersService, LeaderUserService],
})
export class UsersModule {}