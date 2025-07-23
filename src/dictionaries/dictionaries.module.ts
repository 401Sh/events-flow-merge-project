import { Module } from '@nestjs/common';
import { DictionariesController } from './dictionaries.controller';
import { DictionariesService } from './dictionaries.service';
import { HttpModule } from '@nestjs/axios';
import { ClientAuthModule } from 'src/auth/client-auth/client-auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventThemeEntity } from './entities/theme.entity';
import { ExternalThemeRefEntity } from './entities/external-theme.entity';
import { LeaderDictionaryService } from './services/leader-dictionary.service';
import { TimepadDictionaryService } from './services/timepad-dictionary.service';

@Module({
  imports: [
    ClientAuthModule,
    HttpModule,
    TypeOrmModule.forFeature([EventThemeEntity, ExternalThemeRefEntity]),
  ],
  controllers: [DictionariesController],
  providers: [
    DictionariesService,
    LeaderDictionaryService,
    TimepadDictionaryService,
  ],
  exports: [DictionariesService],
})
export class DictionariesModule {}
