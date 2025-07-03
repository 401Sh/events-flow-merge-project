import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { OauthModule } from './auth/oauth/oauth.module';
import { ClientAuthModule } from './auth/client-auth/client-auth.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    EventsModule,
    UsersModule,
    OauthModule,
    ClientAuthModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    HttpModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
