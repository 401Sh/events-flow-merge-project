import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventAPISource } from 'src/events/enums/event-source.enum';
import { EventThemesDto } from './dto/event-themes.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EventThemeEntity } from './entities/theme.entity';
import { In, Repository } from 'typeorm';
import { ExternalThemeRefEntity } from './entities/external-theme.entity';

@Injectable()
export class DictionariesService {
  private readonly logger = new Logger(DictionariesService.name);

  constructor(
    @InjectRepository(EventThemeEntity)
    private eventThemeRepository: Repository<EventThemeEntity>,
    @InjectRepository(ExternalThemeRefEntity)
    private externalThemeRefRepository: Repository<ExternalThemeRefEntity>,
  ) {}

  /**
   * Retrieves all event themes from the repository.
   *
   * @async
   * @returns {Promise<{ data: EventThemeEntity[] }>} An object 
   * containing an array of event themes.
   */
  async findEventThemes() {
    const themes = await this.eventThemeRepository.find();

    this.logger.debug(`Finded themes`, themes);
    return { data: themes };
  }


  /**
   * Finds external theme IDs for the given parent theme IDs 
   * and event API source.
   *
   * @async
   * @param {number[]} parentId - Array of parent event theme IDs.
   * @param {EventAPISource} source - The source of the event API.
   * @returns {Promise<number[]>} An array of external theme IDs 
   * corresponding to the given parent IDs and source.
   */
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
