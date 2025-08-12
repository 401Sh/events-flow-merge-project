import { Injectable, Logger } from '@nestjs/common';
import { EventAPISource } from 'src/external-events/enums/event-source.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { EventThemeEntity } from './entities/theme.entity';
import { In, Repository } from 'typeorm';
import { ExternalThemeRefEntity } from './entities/external-theme.entity';
import { EventThemesDto } from './dto/event-themes.dto';

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
   * @returns {Promise<{ data: EventThemeEntity[] }>} A promise that resolves
   * to an object containing an array of event themes.
   */
  async findEventThemes() {
    const themes = await this.eventThemeRepository.find();

    this.logger.debug(`Finded themes`, themes);
    return themes;
  }


  /**
   * Retrieves all required event themes from the repository by his IDs.
   *
   * @async
   * @param {number[]} themeIds - Array of event theme IDs
   * @returns {Promise<{ data: EventThemeEntity[] }>} A promise that resolves
   * to an object containing an array of event themes.
   */
  async findEventThemesByIds(themeIds: number[]) {
    const themes = await this.eventThemeRepository.find({
      where: {
        id: In(themeIds),
      },
    });

    this.logger.debug(`Finded themes`, themes);
    return themes;
  }


  /**
   * Finds external theme IDs for the given parent theme IDs and event API
   * source.
   *
   * @async
   * @param {number[]} parentId - Array of parent event theme IDs.
   * @param {EventAPISource} source - The source of the event API.
   * @returns {Promise<number[]>} A promise that resolves to an array of
   * external theme IDs corresponding to the given parent IDs and source.
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


  /**
   * Finds event themes corresponding to the given external theme IDs and event
   * API source.
   *
   * @async
   * @param {number[]} externalIds - Array of external theme IDs
   * (source-specific IDs).
   * @param {EventAPISource} source - The source of the event API.
   * @returns {Promise<EventThemesDto[]>} A promise that resolves
   * to an array
   * of event theme objects with `id` and `name` fields.
   */
  async findEventThemesByExternalThemeIds(
    externalIds: number[],
    source: EventAPISource,
  ): Promise<EventThemesDto[]> {
    const externalThemes = await this.externalThemeRefRepository
      .createQueryBuilder('extthemes')
      .leftJoinAndSelect('extthemes.eventTheme', 'eventTheme')
      .where('extthemes.source = :source', { source })
      .andWhere('extthemes.sourceId IN (:...externalIds)', { externalIds })
      .select(['eventTheme.id', 'eventTheme.name'])
      .distinct(true)
      .getRawMany();

    const eventThemes = externalThemes.map((v) => ({
      id: v.eventTheme_id,
      name: v.eventTheme_name,
    }));

    return eventThemes;
  }
}