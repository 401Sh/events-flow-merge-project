import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventAPISource } from 'src/events/enums/event-source.enum';
import { AbstractLeaderDictionaryRepository } from './repositories/abstract-leader-dictionary.repository';
import { AbstractTimepadDictionaryRepository } from './repositories/abstract-timepad-dictionary.repository';
import { EventThemes } from './interfaces/event-themes.interface';

@Injectable()
export class DictionariesService {
  private readonly logger = new Logger(DictionariesService.name);

  constructor(
    private readonly leaderRepository: AbstractLeaderDictionaryRepository,
    private readonly timepadRepository: AbstractTimepadDictionaryRepository,
  ) {}

  async getEventThemesBySource(source: EventAPISource) {
    let result: EventThemes[];

    if (source === EventAPISource.TIMEPAD) {
      result = await this.timepadRepository.getAllThemes();
    } else {
      result = await this.leaderRepository.getAllThemes();
    }

    if (!result) {
      throw new NotFoundException(`Themes not found in source ${source}`);
    }

    return {
      data: {
        themes: result,
      },
    };
  }
}
