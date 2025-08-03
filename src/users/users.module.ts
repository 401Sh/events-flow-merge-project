import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { LeaderUserService } from './services/leader-user.service';
import { ClientAuthModule } from 'src/client-auth/client-auth.module';
import { HttpModule } from '@nestjs/axios';
import { LeaderApiRateLimiterService } from 'src/api-utils/leader-api-rate-limiter.service';
import { ExternalUsersService } from './external-users.service';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [
    ClientAuthModule,
    HttpModule,
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    ExternalUsersService,
    LeaderUserService,
    LeaderApiRateLimiterService,
  ],
  exports: [UsersService]
})
export class UsersModule {}