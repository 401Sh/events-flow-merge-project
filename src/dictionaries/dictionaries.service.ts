import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventAPISource } from 'src/events/enums/event-source.enum';
import { EventThemesDto } from './dto/event-themes.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EventThemeEntity } from './entities/theme.entity';
import { In, Repository } from 'typeorm';
import { ExternalThemeRefEntity } from './entities/external-theme.entity';
import { TimepadDictionaryService } from './services/timepad-dictionary.service';
import { LeaderDictionaryService } from './services/leader-dictionary.service';

@Injectable()
export class DictionariesService {
  private readonly logger = new Logger(DictionariesService.name);

  constructor(
    @InjectRepository(EventThemeEntity)
    private eventThemeRepository: Repository<EventThemeEntity>,
    @InjectRepository(ExternalThemeRefEntity)
    private externalThemeRefRepository: Repository<ExternalThemeRefEntity>,

    private readonly leaderService: LeaderDictionaryService,
    private readonly timepadService: TimepadDictionaryService,
  ) {}

  async findEventThemes() {
    const themes = await this.eventThemeRepository.find();

    this.logger.debug(`Finded themes`, themes);
    return { data: themes };
  }

  
  async findEventThemesBySource(source: EventAPISource) {
    let result: EventThemesDto[];

    if (source === EventAPISource.TIMEPAD) {
      result = await this.timepadService.getAllThemes();
    } else {
      result = await this.leaderService.getAllThemes();
    }

    if (!result) {
      throw new NotFoundException(`Themes not found in source ${source}`);
    }

    return { data: result };
  }


  async findExternalThemeIds(parentId: number[], source: EventAPISource) {
    const themeIds = await this.externalThemeRefRepository.find({
      where: {
        eventTheme: {
          id: In(parentId),
        },
        source: source,
      },
      select: ['sourceId'],
    });

    const externalIds = themeIds.map((v) => v.sourceId);

    return externalIds;
  }
}
