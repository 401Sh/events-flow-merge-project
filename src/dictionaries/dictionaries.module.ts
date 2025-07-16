import { Module } from '@nestjs/common';
import { DictionariesController } from './dictionaries.controller';
import { DictionariesService } from './dictionaries.service';
import { AbstractLeaderDictionaryRepository } from './repositories/abstract-leader-dictionary.repository';
import { AbstractTimepadDictionaryRepository } from './repositories/abstract-timepad-dictionary.repository';
import { LeaderDictionaryRepository } from './repositories/leader-dictionary.repository';
import { TimepadDictionaryRepository } from './repositories/timepad-dictionary.repository';
import { HttpModule } from '@nestjs/axios';
import { ClientAuthModule } from 'src/auth/client-auth/client-auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventThemeEntity } from './entities/theme.entity';
import { ExternalThemeRefEntity } from './entities/external-theme.entity';

@Module({
  imports: [
    ClientAuthModule, 
    HttpModule,
    TypeOrmModule.forFeature([
      EventThemeEntity,
      ExternalThemeRefEntity,
    ])
  ],
  controllers: [DictionariesController],
  providers: [
    DictionariesService,
    {
      provide: AbstractLeaderDictionaryRepository,
      useClass: LeaderDictionaryRepository,
    },
    {
      provide: AbstractTimepadDictionaryRepository,
      useClass: TimepadDictionaryRepository,
    },
  ],
  exports: [DictionariesService],
})
export class DictionariesModule {}
