import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventBodyDto } from './dto/create-event-body.dto';
import { UpdateEventBodyDto } from './dto/update-event-body.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { StorageService } from 'src/storage/storage.service';
import { S3_EVENT_BUCKET } from 'src/common/constants/s3-buckets.constant';
import { Readable } from 'stream';
import { EventThemeEntity } from 'src/dictionaries/entities/theme.entity';
import { DictionariesService } from 'src/dictionaries/dictionaries.service';
import { GetEventListQueryDto } from './dto/get-event-list-query.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,

    private usersService: UsersService,
    private storageService: StorageService,
    private dictionaryService: DictionariesService,
  ) {}

  /**
   * Creates a new event for a specific user with optional associated themes.
   *
   * @param {number} userId - The ID of the user creating the event.
   * @param {CreateEventBodyDto} data - The event data including optional theme
   * IDs.
   * @returns {Promise<EventEntity>} The newly created event entity.
   * @throws Will throw an error if the user is not found or if saving fails.
   */
  async create(userId: number, data: CreateEventBodyDto) {
    const user = await this.usersService.findById(userId);

    const { themeIds, ...otherData } = data;

    let themes: EventThemeEntity[] = [];

    if (themeIds && themeIds.length != 0) {
      themes = await this.dictionaryService.findEventThemesByIds(themeIds);
    }

    const event = await this.eventRepository.save({
      ...otherData,
      user: user,
      themes: themes.length ? themes : undefined,
    });

    this.logger.log(`Created new event for user: ${userId}`);
    this.logger.debug(`Created new event: `, event);
    return event;
  }


  /**
   * Retrieves an published event by its ID, including its themes.
   *
   * @param {number} eventId - The ID of the event to retrieve.
   * @returns {Promise<EventEntity>} The event entity with themes.
   * @throws {BadRequestException} Throws if the event with the given ID does
   * not exist.
   */
  async findPublishedById(eventId: number) {
    const event = await this.eventRepository.findOne({
      where: {
        id: eventId,
        isPublished: true,
      }
    })


    if (!event) {
      this.logger.log(`No event with id: ${eventId}`);
      throw new BadRequestException('Event does not exist');
    }

    this.logger.log(`Finded event with id: ${eventId}`);
    this.logger.debug(`Finded event with id: `, event);
    return event;
  }


  /**
   * Retrieves an event by its ID, including its themes and the user ID only.
   *
   * @param {number} eventId - The ID of the event to retrieve.
   * @returns {Promise<EventEntity>} The event entity with themes and user ID.
   * @throws {BadRequestException} Throws if the event with the given ID does
   * not exist.
   */
  async findById(eventId: number) {
    const event = await this.eventRepository
      .createQueryBuilder('events')
      .leftJoinAndSelect('events.themes', 'themes')
      .leftJoin('events.user', 'user')
      .where('events.id = :eventId', { eventId })
      .select(['events', 'themes', 'user.id'])
      .getOne();

    if (!event) {
      this.logger.log(`No event with id: ${eventId}`);
      throw new BadRequestException('Event does not exist');
    }

    this.logger.log(`Finded event with id: ${eventId}`);
    this.logger.debug(`Finded event with id: `, event);
    return event;
  }


  /**
   * Retrieves a paginated list of published events, with optional filtering 
   * by search text and date range.
   *
   * @param {GetEventListQueryDto} query - Query parameters for filtering and
   * pagination.
   * @returns {Promise<{
   *   data: EventEntity[];
   *   meta: {
   *     totalEventsCount: number;
   *     totalPagesAmount: number;
   *     currentPage: number;
   *   }
   * }>} Paginated list of events matching the criteria.
   */
  async findAllPublished(query: GetEventListQueryDto) {
    const { limit, page, search, dateFrom, dateTo } = query;

    const queryBuilder = this.eventRepository.createQueryBuilder('events');

    queryBuilder.leftJoinAndSelect('events.themes', 'themes');

    if (search) {
      const searchLower = search.toLowerCase();

      queryBuilder.andWhere(
        '(LOWER(events.title) Like :search OR LOWER(events.description) LIKE :search)',
        {
          search: `%${searchLower}%`,
        },
      );
    }

    if (dateFrom) {
      queryBuilder.andWhere('events.startsAt >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('events.endsAt <= :dateTo', { dateTo });
    }

    queryBuilder.andWhere('events.isPublished = true');
    queryBuilder.orderBy('events.startsAt', 'ASC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [events, eventsCount] = await queryBuilder.getManyAndCount();
    const totalPagesAmount = Math.ceil(eventsCount / limit);

    this.logger.debug('Get events list: ', events);
    return {
      data: events,
      meta: {
        totalEventsCount: eventsCount,
        totalPagesAmount: totalPagesAmount,
        currentPage: page,
      },
    };
  }


  /**
   * Retrieves a paginated list of events created by a specific user,
   * with optional filtering by search text and date range.
   *
   * @param {number} userId - The ID of the user whose events are being queried.
   * @param {GetEventListQueryDto} query - Query parameters for filtering and
   * pagination.
   * @returns {Promise<{
   *   data: EventEntity[];
   *   meta: {
   *     totalEventsCount: number;
   *     totalPagesAmount: number;
   *     currentPage: number;
   *   }
   * }>} Paginated list of events matching the criteria.
   */
  async findMy(userId: number, query: GetEventListQueryDto) {
    const { limit, page, search, dateFrom, dateTo } = query;

    const queryBuilder = this.eventRepository.createQueryBuilder('events');

    queryBuilder.leftJoinAndSelect('events.themes', 'themes');
    queryBuilder.leftJoin('events.user', 'user');
    queryBuilder.where('user.id = :userId', { userId });

    if (search) {
      const searchLower = search.toLowerCase();

      queryBuilder.andWhere(
        '(LOWER(events.title) Like :search OR LOWER(events.description) LIKE :search)',
        {
          search: `%${searchLower}%`,
        },
      );
    }

    if (dateFrom) {
      queryBuilder.andWhere('events.startsAt >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('events.endsAt <= :dateTo', { dateTo });
    }

    queryBuilder.orderBy('events.startsAt', 'ASC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [events, eventsCount] = await queryBuilder.getManyAndCount();
    const totalPagesAmount = Math.ceil(eventsCount / limit);

    this.logger.debug('Get my events list: ', events);
    return {
      data: events,
      meta: {
        totalEventsCount: eventsCount,
        totalPagesAmount: totalPagesAmount,
        currentPage: page,
      },
    };
  }


  /**
   * Updates an existing event by its ID with new data, including optional themes.
   *
   * @param {number} eventId - The ID of the event to update.
   * @param {UpdateEventBodyDto} data - The data to update the event with,
   * including optional theme IDs.
   * @returns {Promise<EventEntity>} The updated event entity.
   * @throws {NotFoundException} Throws if the event with the given ID does not
   * exist.
   */
  async update(eventId: number, data: UpdateEventBodyDto) {
    this.logger.log(`Updating event with id: ${eventId}`);

    const { themeIds, ...otherData } = data;

    const event = await this.eventRepository.findOne({
      where: {
        id: eventId,
      },
      relations: ['themes'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    Object.assign(event, otherData);

    if (themeIds && themeIds.length > 0) {
      const newThemes =
        await this.dictionaryService.findEventThemesByIds(themeIds);
      event.themes = newThemes;
    } else if (themeIds && themeIds.length === 0) {
      event.themes = [];
    }

    const updatedEvent = await this.eventRepository.save(event);

    this.logger.log(`Event with id ${eventId} updated successfully`);
    return updatedEvent;
  }


  /**
   * Deletes an event by its ID.
   *
   * @param {number} eventId - The ID of the event to delete.
   * @returns {Promise<DeleteResult>} The result of the deletion operation.
   * @throws {NotFoundException} Throws if the event with the given ID does not
   * exist.
   */
  async delete(eventId: number) {
    this.logger.log(`Deleting event with id: ${eventId}`);
    const deleteResult = await this.eventRepository.delete({ id: eventId });

    if (deleteResult.affected === 0) {
      this.logger.log(`Cannot delete event. No event with id: ${eventId}`);
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    return deleteResult;
  }


  /**
   * Updates the poster URL of an event by uploading a new file to storage,
   * and deletes the old poster file if it exists.
   *
   * @param {number|string} eventId - The ID of the event to update.
   * @param {string} fileName - The name of the file to upload.
   * @param {Buffer|Readable} body - The file content as a Buffer or Readable
   * stream.
   * @param {string} mimetype - The MIME type of the file.
   * @returns {Promise<EventEntity>} The updated event entity with the new
   * poster URL.
   * @throws {BadRequestException} Throws if the event does not exist.
   */
  async updatePosterUrl(
    eventId: any,
    fileName: string,
    body: Buffer | Readable,
    mimetype: string,
  ) {
    const event = await this.eventRepository.findOne(eventId);

    if (!event) {
      this.logger.log(`No event with id: ${eventId}`);
      throw new BadRequestException('Event does not exist');
    }

    if (event.posterUrl) {
      await this.storageService.deleteFileInBucket(
        S3_EVENT_BUCKET,
        event.posterUrl,
      );
    }

    const url = await this.storageService.uploadFileInBucket(
      S3_EVENT_BUCKET,
      fileName,
      body,
      mimetype,
    );

    event.posterUrl = url;
    const updatedEvent = await this.eventRepository.save(event);

    return updatedEvent;
  }
}