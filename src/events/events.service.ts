import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateEventBodyDto } from './dto/create-event-body.dto';
import { UpdateEventBodyDto } from './dto/update-event-body.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { StorageService } from 'src/storage/storage.service';
import { S3_EVENT_BUCKET } from 'src/common/constants/s3-buckets.constant';
import { Readable } from 'stream';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,

    private usersService: UsersService,
    private storageService: StorageService,
  ) {}

  async create(userId: number, data: CreateEventBodyDto) {
    const user = await this.usersService.findById(userId);

    // if (data.endsAt && data.startsAt > data.endsAt) {
    //   throw new BadRequestException(
    //     'The startsAt date cannot be later than the endsAt date'
    //   );
    // }

    const event = await this.eventRepository.save({
      ...data,
      user: user,
    });

    this.logger.log(`Created new event for user: ${userId}`);
    this.logger.debug(`Created new event: `, event);
    return event;
  }


  async findById(eventId: number) {
    const event = await this.eventRepository
      .createQueryBuilder("events")
      .leftJoinAndSelect("events.themes", "themes")
      .where("events.id = :id", { eventId })
      .getOne();

    if (!event) {
      this.logger.log(`No event with id: ${eventId}`);
      throw new BadRequestException('Event does not exist');
    }

    this.logger.log(`Finded event with id: ${eventId}`);
    this.logger.log(`Finded event with id: `, event);
    return event;
  }


  async update(eventId: number, data: UpdateEventBodyDto) {
    this.logger.log(`Updating event with id: ${eventId}`);
    await this.eventRepository.update({ id: eventId }, data);

    const updatedEvent = await this.eventRepository.findOne({
      where: {
        id: eventId,
      },
    });

    return updatedEvent;
  }


  async delete(eventId: number) {
    this.logger.log(`Deleting event with id: ${eventId}`);
    const deleteResult = await this.eventRepository.delete({ id: eventId });

    if (deleteResult.affected === 0) {
      this.logger.log(`Cannot delete event. No event with id: ${eventId}`);
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    return deleteResult;
  }


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