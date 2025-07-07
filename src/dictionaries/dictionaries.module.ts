import { Module } from '@nestjs/common';
import { DictionariesController } from './dictionaries.controller';
import { DictionariesService } from './dictionaries.service';
import { AbstractLeaderDictionaryRepository } from './repositories/abstract-leader-dictionary.repository';
import { AbstractTimepadDictionaryRepository } from './repositories/abstract-timepad-dictionary.repository';
import { LeaderDictionaryRepository } from './repositories/leader-dictionary.repository';
import { TimepadDictionaryRepository } from './repositories/timepad-dictionary.repository';
import { HttpModule } from '@nestjs/axios';
import { ClientAuthModule } from 'src/auth/client-auth/client-auth.module';

@Module({
  imports: [
    ClientAuthModule,
    HttpModule
  ],
  controllers: [DictionariesController],
  providers: [
    DictionariesService,
    { 
      provide: AbstractLeaderDictionaryRepository, 
      useClass: LeaderDictionaryRepository 
    },
    { 
      provide: AbstractTimepadDictionaryRepository, 
      useClass: TimepadDictionaryRepository 
    },
  ]
})
export class DictionariesModule {}
