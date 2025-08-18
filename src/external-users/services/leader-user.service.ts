import { APIUserInterface } from './api-user.service.interface';
import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mapLeaderUser } from '../api-utils/user-profile-map';
import { RESTMethod } from '../enums/rest-method.enum';
import { VisitedEventDto } from '../dto/visited-event.dto';
import { SubscribeLeaderEventDto } from '../dto/subscribe-leader-event.dto';
import { LeaderVisitedMapperService } from './leader-visited-mapper.service';
import { LeaderUserFetchService } from './leader-user-fetch.service';

@Injectable()
export class LeaderUserService implements APIUserInterface {
  private readonly logger = new Logger(LeaderUserService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly leaderMapper: LeaderVisitedMapperService,
    private readonly leaderUserFetchService: LeaderUserFetchService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('LEADER_API_URL');
  }

  async getUser(userId: number) {
    const rawUser = await this.leaderUserFetchService.requestLeaderApi<{ data: any }>(
      RESTMethod.GET,
      `/users/${userId}`,
    );

    if (!rawUser) {
      this.logger.log(`Leader user profile ${userId} not found`);
      throw new NotFoundException(
        `User profile with id ${userId} not found in source leaderId`,
      );
    }

    const normalizedUser = mapLeaderUser(rawUser);

    this.logger.debug(
      'Leader user profile recieved successfully',
      normalizedUser,
    );

    return normalizedUser;
  }


  async getUserEventHistory(
    token: string,
    userId: number,
    isCompleted: boolean,
  ) {
    let page = 1;
    const now = new Date();
    const allEvents: any[] = [];

    const firstPageData = await this.leaderUserFetchService.fetchVisitedEventPage(
      token,
      userId,
      page
    );

    const totalPages = firstPageData.meta.paginationPageCount;

    let rawEvents = firstPageData.items || [];

    const filteredEvents = this.filterVisitedEvents(rawEvents, now, isCompleted);
    allEvents.push(...filteredEvents);

    for (page += 1; page <= totalPages; page++) {
      const data = await this.leaderUserFetchService.fetchVisitedEventPage(
        token,
        userId,
        page
      );
  
      const rawEvents = data.items || [];

      const filteredEvents = this.filterVisitedEvents(rawEvents, now, isCompleted);
      allEvents.push(...filteredEvents);
    }

    this.logger.debug('Leader participation list received and filtered successfully');
    return allEvents.map(this.leaderMapper.map);
  }


  async subscribeToEvent(
    token: string,
    userId: number,
    body: SubscribeLeaderEventDto,
  ) {
    const rawEvent = await this.leaderUserFetchService.requestLeaderApi<
    VisitedEventDto
    >(
      RESTMethod.POST,
      `/users/${userId}/event-participations`,
      token,
      undefined,
      body,
    );

    this.logger.debug('Leader event subscribed successfully');
    const mappedEvent = this.leaderMapper.map(rawEvent);

    return mappedEvent;
  }


  async unsubscribeToEvent(token: string, userId: number, uuid: string) {
    const result = await this.leaderUserFetchService.requestLeaderApi<any>(
      RESTMethod.DELETE,
      `/users/${userId}/event-participations/${uuid}`,
      token,
    );

    this.logger.debug('Leader event unsubscribed successfully');

    return result;
  }


  /**
   * Filters visited events based on their start date relative to the current date,
   * allowing selection of either completed (past) or upcoming (future) events.
   *
   * This method compares each event's `event.dateStart` against the provided 
   * `now` date and returns events that are either before or after `now`, 
   * depending on the `isCompleted` flag.
   *
   * @param {any[]} events - The array of visited events to filter.
   * @param {Date} now - The reference date used to determine if an event is 
   * completed or upcoming.
   * @param {boolean} isCompleted - Flag indicating which events to select:
   *   - `true`: returns events where the start date is less than or equal to 
   * `now` (completed events).
   *   - `false`: returns events where the start date is greater than `now` 
   * (upcoming events).
   * @returns {any[]} A filtered array of events matching the specified 
   * completion criteria.
   * @private
   */
  private filterVisitedEvents(
    events: any[] = [],
    now: Date,
    isCompleted: boolean,
  ) {
    return events.filter(e => {
      const eventDate = new Date(e.event.dateStart);
      return isCompleted ? eventDate <= now : eventDate > now;
    });
  }
}