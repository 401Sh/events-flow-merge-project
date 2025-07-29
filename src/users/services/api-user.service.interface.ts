import { GetParticipantsQueryDto } from "../dto/get-participants-query.dto";
import { SubscribeLeaderEventDto } from "../dto/subscribe-leader-event.dto";
import { UserProfileDto } from "../dto/user-profile.dto";
import { VisitedEventsListResultDto } from "../dto/visited-event-list-result.dto";
import { VisitedEventDto } from "../dto/visited-event.dto";

export interface APIUserInterface {
  /**
   * Fetches and normalizes the profile information of a user from the API.
   *
   * @async
   * @param {number} userId - The ID of the user whose profile is being 
   * requested.
   * @returns {Promise<UserProfileDto>} A promise that resolves to an object 
   * with normalized user profile data.
   */
  getUser(userId: number): Promise<UserProfileDto>;

  /**
   * Retrieves a paginated list of event participations for a specific user 
   * from the API.
   * 
   * Maps the raw data into internal `VisitedEventDto` format and includes 
   * pagination metadata.
   *
   * @async
   * @param {string} token - Authorization token used to authenticate the 
   * request.
   * @param {number} userId - The ID of the user whose participations are 
   * being requested.
   * @param {GetParticipantsQueryDto} query - Query parameters for pagination 
   * (e.g., limit and page).
   * @returns {Promise<{
  *   data: VisitedEventDto[],
  *   meta: {
  *     totalEventsAmount: number,
  *     totalPagesAmount: number,
  *     currentPage: number
  *   }
  * }>} A promise that resolves to an object containing the user's event 
  * participations and pagination metadata.
  */
  getUserParticipations(
    token: string,
    userId: number, 
    query: GetParticipantsQueryDto,
  ): Promise<VisitedEventsListResultDto>;

  /**
   * Retrieves a user's event history from the API, either completed or 
   * upcoming events, based on the `isCompleted` flag.
   *
   * @async
   * @param {string} token - Authorization token used to authenticate the 
   * request.
   * @param {number} userId - The ID of the user whose event history is being 
   * requested.
   * @param {boolean} isCompleted - If `true`, fetches completed (visited) 
   * events; otherwise, upcoming (future) events.
   * @returns {Promise<VisitedEventDto[]>} A promise that resolves to an array 
   * of visited event data.
   */
  getUserEventHistory(
    token: string,
    userId: number, 
    isCompleted: boolean,
  ): Promise<VisitedEventDto[]>

  /**
   * Subscribes a user to an event via the API.
   *
   * @async
   * @param {string} token - Authorization token used to authenticate the 
   * request.
   * @param {number} userId - The ID of the user subscribing to the event.
   * @param {SubscribeLeaderEventDto} body - The event subscription details.
   * @returns {Promise<VisitedEventDto>} A promise that resolves to an object 
   * with the subscribed event data, normalized.
   */
  subscribeToEvent(
    token: any, 
    userId: number,
    body: SubscribeLeaderEventDto,
  ): Promise<VisitedEventDto>

  /**
   * Unsubscribes a user from a specific event participation via the API.
   *
   * @async
   * @param {string} token - Authorization token used to authenticate the 
   * request.
   * @param {number} userId - The ID of the user unsubscribing from the event.
   * @param {string} uuid - The unique identifier of the event participation to 
   * unsubscribe from.
   * @returns {Promise<any>} Result of the unsubscription operation.
   */
  unsubscribeToEvent(
    token: any, 
    userId: number, 
    uuid: string
  ): Promise<any>
}
