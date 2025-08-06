import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { OauthModule } from './oauth/oauth.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { DictionariesModule } from './dictionaries/dictionaries.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './common/configs/typeorm.config';
import { GeoModule } from './geo/geo.module';
import { AuthModule } from './auth/auth.module';
import { ExternalEventsModule } from './external-events/external-events.module';
import { ExternalUsersModule } from './external-users/external-users.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { THROTTLE_DEFAULT_LIMIT, THROTTLE_DEFAULT_TTL } from './common/constants/throttle.constant';
import { ApiKeyGuard } from './common/guards/api-key.guard';

@Module({
  imports: [
    EventsModule,
    UsersModule,
    OauthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    DictionariesModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    GeoModule,
    AuthModule,
    ExternalEventsModule,
    ExternalUsersModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: THROTTLE_DEFAULT_TTL,
          limit: THROTTLE_DEFAULT_LIMIT,
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    ApiKeyGuard,
  ],
  exports: [ApiKeyGuard],
})
export class AppModule {}