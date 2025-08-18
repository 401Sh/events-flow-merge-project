import { Injectable, Logger } from '@nestjs/common';
import { LeaderUserService } from '../external-users/services/leader-user.service';
import { SubscribeLeaderEventDto } from '../external-users/dto/subscribe-leader-event.dto';
import { LeaderParticipationService } from './services/leader-participation.service';

@Injectable()
export class ExternalUsersService {
  private readonly logger = new Logger(ExternalUsersService.name);

  constructor(
    private readonly leaderService: LeaderUserService,
    private readonly leaderParticipationService: LeaderParticipationService,
  ) {}

  /**
   * Retrieves the profile information of a user under a leader's context.
   *
   * @async
   * @param {number} userId - The ID of the user whose profile is being
   * requested.
   * @returns {Promise<{ data: UserProfileDto }>} A promise that resolves to an
   * object containing the user's profile data.
   */
  async getLeaderUser(userId: number) {
    const data = await this.leaderService.getUser(userId);

    return { data };
  }


  async getLeaderEventParticipations(
    token: string,
    userId: number,
    eventId: number
  ) {
    const result = await this.leaderParticipationService.getEventParticipations(
      token,
      userId,
      eventId,
    );

    return result;
  }


  /**
   * Retrieves a list of a user's event history under a leader's context,
   * filtered by completion status.
   *
   * @async
   * @param {string} token - Authorization token used to authenticate the
   * request.
   * @param {number} userId - The ID of the user whose event history is being
   * requested.
   * @param {boolean} isCompleted - Indicates whether to fetch completed
   * (`true`) or ongoing (`false`) events.
   * @returns {Promise<{ data: VisitedEventDto[] }>} A promise that resolves to
   * an object containing a list of visited events.
   */
  async getLeaderUserEventHistory(
    token: string,
    userId: number,
    isCompleted: boolean,
  ) {
    const result = await this.leaderService.getUserEventHistory(
      token,
      userId,
      isCompleted,
    );

    return { data: result };
  }


  /**
   * Subscribes a user to an event under a leader's context.
   *
   * @async
   * @param {string} token - Authorization token used to authenticate the
   * request.
   * @param {number} userId - The ID of the user who is subscribing to the
   * event.
   * @param {SubscribeLeaderEventDto} body - The subscription details
   * (e.g. event ID, preferences).
   * @returns {Promise<VisitedEventDto>} A promise that resolves to an object
   * containing subscribed event.
   */
  async subscribeToLeaderEvent(
    token: string,
    userId: number,
    body: SubscribeLeaderEventDto,
  ) {
    const result = await this.leaderService.subscribeToEvent(
      token,
      userId,
      body,
    );

    return result;
  }


  /**
   * Unsubscribes a user from a specific event under a leader's context.
   *
   * @async
   * @param {string} token - Authorization token used to authenticate the
   * request.
   * @param {number} userId - The ID of the user who is unsubscribing from the
   * event.
   * @param {string} uuid - The unique identifier of the event subscription to
   * cancel.
   * @returns {Promise<any>} Result of the unsubscription operation.
   */
  async unsubscribeToLeaderEvent(token: string, userId: number, uuid: string) {
    const result = await this.leaderService.unsubscribeToEvent(
      token,
      userId,
      uuid,
    );

    return result;
  }
}