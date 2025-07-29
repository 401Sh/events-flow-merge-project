import { Injectable, Logger } from '@nestjs/common';
import { GetParticipantsQueryDto } from './dto/get-participants-query.dto';
import { LeaderUserService } from './services/leader-user.service';
import { SubscribeLeaderEventDto } from './dto/subscribe-leader-event.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly leaderService: LeaderUserService,
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

  
  /**
   * Retrieves a paginated list of event participations for a specific user 
   * under a leader's context.
   *
   * @async
   * @param {string} token - Authorization token used to authenticate the 
   * request.
   * @param {number} userId - The ID of the user whose participations are being 
   * requested.
   * @param {GetParticipantsQueryDto} query - Query parameters for filtering 
   * and pagination.
   * @returns {Promise<{
   *   data: VisitedEventDto[],
   *   meta: {
   *     totalEventsAmount: number,
   *     totalPagesAmount: number,
   *     currentPage: number
   *   }
   * }>} A promise that resolves to an object containing a list of visited 
   * events and pagination metadata.
   */
  async getLeaderUserParticipations(
    token: string, 
    userId: number, 
    query: GetParticipantsQueryDto,
  ) {
    const result = await this.leaderService.getUserParticipations(
      token, 
      userId, 
      query,
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
    isCompleted: boolean
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
  async unsubscribeToLeaderEvent(
    token: string, 
    userId: number, 
    uuid: string
  ) {
    const result = await this.leaderService.unsubscribeToEvent(
      token, 
      userId, 
      uuid,
    );

    return result;
  }
}
