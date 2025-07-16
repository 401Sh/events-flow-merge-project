import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { OauthModule } from './auth/oauth/oauth.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { DictionariesModule } from './dictionaries/dictionaries.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './configs/typeorm.config';
import { GeoModule } from './geo/geo.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
