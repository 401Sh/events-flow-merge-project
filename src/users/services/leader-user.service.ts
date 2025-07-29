import { APIUserInterface } from "./api-user.service.interface";
import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { LeaderClientAuthService } from "src/auth/client-auth/leader-client-auth.service";
import { GetParticipantsQueryDto } from "../dto/get-participants-query.dto";
import { mapLeaderVisited } from "../api-utils/visited-leader-map";
import { mapLeaderUser } from "../api-utils/user-profile-map";
import { RESTMethod } from "../enums/rest-method.enum";
import { VisitedEventDto } from "../dto/visited-event.dto";
import { SubscribeLeaderEventDto } from "../dto/subscribe-leader-event.dto";

@Injectable()
export class LeaderUserService implements APIUserInterface {
  private readonly logger = new Logger(LeaderUserService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: LeaderClientAuthService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('LEADER_API_URL');
  }

  /**
   * Fetches and normalizes the profile information of a user 
   * from the leader API.
   *
   * @async
   * @function
   * @param {number} userId - The ID of the user whose profile 
   * is being requested.
   * @returns {Promise<UserProfileDto>} An object with normalized 
   * user profile data.
   * @throws {NotFoundException} If the user is not found in the 
   * leader API.
   */
  async getUser(userId: number) {
    const rawUser = await this.requestLeaderApi<{ data: any }>(
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

    this.logger.debug('Leader user profile recieved successfully', normalizedUser);

    return normalizedUser;
  }
  
  
  /**
   * Retrieves a paginated list of event participations for a 
   * specific user from the leader API.
   * Maps the raw data into internal `VisitedEventDto` format 
   * and includes pagination metadata.
   *
   * @async
   * @function
   * @param {string} token - Authorization token used to 
   * authenticate the request.
   * @param {number} userId - The ID of the user whose 
   * participations are being requested.
   * @param {GetParticipantsQueryDto} query - Query parameters 
   * for pagination (e.g., limit and page).
   * @returns {Promise<{
   *   data: VisitedEventDto[],
   *   meta: {
   *     totalEventsAmount: number,
   *     totalPagesAmount: number,
   *     currentPage: number
   *   }
   * }>} An object containing the user's event participations 
   * and pagination metadata.
   */
  async getUserParticipations(
    token: string, 
    userId: number, 
    query: GetParticipantsQueryDto,
  ) {
    const { limit, page } = query;
    const params = {
      paginationSize: limit,
      paginationPage: page,
    };

    type LeaderResponseType = {
      items: any[];
      meta: {
        totalCount: number;
        paginationPageCount: number;
        paginationPage: number;
      };
    };

    const data = await this.requestLeaderApi<LeaderResponseType>(
      RESTMethod.GET,
      `/users/${userId}/event-participations`,
      token,
      params,
    );
    
    const rawEvents = data.items || [];
    const mappedEvents = rawEvents.map(mapLeaderVisited);

    this.logger.debug('Leader event list recieved successfully');

    const dataWithMeta = {
      data: mappedEvents,
      meta: {
        totalEventsAmount: data.meta.totalCount,
        totalPagesAmount: data.meta.paginationPageCount,
        currentPage: data.meta.paginationPage,
      },
    };

    return dataWithMeta;
  }


  /**
   * Retrieves a user's event history from the leader API, either 
   * completed or upcoming events,
   * based on the `isCompleted` flag.
   *
   * @async
   * @function
   * @param {string} token - Authorization token used to 
   * authenticate the request.
   * @param {number} userId - The ID of the user whose event 
   * history is being requested.
   * @param {boolean} isCompleted - If `true`, fetches completed 
   * (visited) events; otherwise, upcoming (future) events.
   * @returns {Promise<VisitedEventDto[]>} An array of visited event data.
   */
  async getUserEventHistory(
    token: string, 
    userId: number, 
    isCompleted: boolean,
  ) {
    if (isCompleted) {
      return await this.getVisitedUserEvents(token, userId);
    }

    return await this.getFutureUserEvents(token, userId);
  }


  /**
   * Subscribes a user to an event via the leader API.
   *
   * @async
   * @function
   * @param {string} token - Authorization token used to 
   * authenticate the request.
   * @param {number} userId - The ID of the user subscribing 
   * to the event.
   * @param {SubscribeLeaderEventDto} body - The event 
   * subscription details.
   * @returns {Promise<VisitedEventDto>} An object with the 
   * subscribed event data, normalized.
   */
  async subscribeToEvent(
    token: string, 
    userId: number, 
    body: SubscribeLeaderEventDto,
  ) {
    const rawEvent = await this.requestLeaderApi<VisitedEventDto>(
      RESTMethod.POST,
      `/users/${userId}/event-participations`,
      token,
      undefined,
      body,
    );

    this.logger.debug('Leader event subscribed successfully');
    const mappedEvent = mapLeaderVisited(rawEvent);

    return mappedEvent;
  }


  /**
   * Unsubscribes a user from a specific event participation 
   * via the leader API.
   *
   * @async
   * @function
   * @param {string} token - Authorization token used to 
   * authenticate the request.
   * @param {number} userId - The ID of the user unsubscribing 
   * from the event.
   * @param {string} uuid - The unique identifier of the event 
   * participation to unsubscribe from.
   * @returns {Promise<any>} Result of the unsubscription operation.
   */
  async unsubscribeToEvent(
    token: string, 
    userId: number, 
    uuid: string
  ) {
    const result = await this.requestLeaderApi<any>(
      RESTMethod.DELETE,
      `/users/${userId}/event-participations/${uuid}`,
      token,
    );

    this.logger.debug('Leader event unsubscribed successfully');

    return result;
  }


  /**
   * Fetches all future (not completed) event participations 
   * for a user from the leader API.
   * This method paginates through results until no more future 
   * events remain or all pages are fetched.
   *
   * @private
   * @async
   * @function
   * @param {string} token - Authorization token used to 
   * authenticate the request.
   * @param {number} userId - The ID of the user whose future 
   * events are being fetched.
   * @returns {Promise<VisitedEventDto[]>} An array of future 
   * event participations, normalized.
   */
  private async getFutureUserEvents(token: string, userId: number) {
    const limit = 100;
    let page = 1;
    let allEvents: any[] = [];
    let keepFetching = true;

    type LeaderResponseType = {
      items: any[];
      meta: {
        totalCount: number;
        paginationPageCount: number;
        paginationPage: number;
      };
    };
  
    while (keepFetching) {
      const params = {
        paginationSize: limit,
        paginationPage: page,
      };
  
      const data = await this.requestLeaderApi<LeaderResponseType>(
        RESTMethod.GET,
        `/users/${userId}/event-participations`, 
        token,
        params,
      );
  
      const rawEvents = data.items || [];
      if (rawEvents.length === 0) break;
  
      const futureEvents = rawEvents.filter(e => e.completed === false);
      allEvents.push(...futureEvents);
  
      if (rawEvents.some(e => e.completed === true)) break;
      if (rawEvents.length < limit) break;
  
      page++;
    }
  
    return allEvents.map(mapLeaderVisited);
  }


  /**
   * Fetches all completed (visited) event participations 
   * for a user from the leader API.
   * It paginates through results and collects events marked 
   * as completed.
   *
   * @private
   * @async
   * @function
   * @param {string} token - Authorization token used to 
   * authenticate the request.
   * @param {number} userId - The ID of the user whose visited 
   * events are being fetched.
   * @returns {Promise<VisitedEventDto[]>} An array of completed 
   * event participations, normalized.
   */
  private async getVisitedUserEvents(token: string, userId: number) {
    const limit = 100;
    let page = 1;
    let allEvents: any[] = [];
    let foundVisited = false;
    let keepFetching = true;

    type LeaderResponseType = {
      items: any[];
      meta: {
        totalCount: number;
        paginationPageCount: number;
        paginationPage: number;
      };
    };
  
    while (keepFetching) {
      const params = {
        paginationSize: limit,
        paginationPage: page,
      };
  
      const data = await this.requestLeaderApi<LeaderResponseType>(
        RESTMethod.GET,
        `/users/${userId}/event-participations`, 
        token,
        params,
      );
  
      const rawEvents = data.items || [];
      if (rawEvents.length === 0) break;
  
      if (!foundVisited) {
        const visitedEvents = rawEvents.filter(e => e.completed === true);
        if (visitedEvents.length > 0) {
          foundVisited = true;
          allEvents.push(...visitedEvents);
        }
      } else {
        allEvents.push(...rawEvents);
      }
  
      if (rawEvents.length < limit) break;
  
      page++;
    }
  
    allEvents = allEvents.filter(e => e.completed === true);
  
    return allEvents.map(mapLeaderVisited);
  }


  /**
   * Sends an HTTP request to the leader API with the specified 
   * method, URL, and optional parameters.
   * Automatically attaches the authorization token, either from 
   * the provided token or via the auth service.
   * Handles errors by logging and throwing an appropriate HTTP 
   * exception.
   *
   * @private
   * @async
   * @template T - The expected response data type.
   * @param {RESTMethod} method - The HTTP method to use for 
   * the request (GET, POST, DELETE, etc.).
   * @param {string} urlPart - The URL path appended to the base 
   * URL for the leader API.
   * @param {string} [token] - Optional authorization token; 
   * if omitted, fetches token from auth service.
   * @param {object} [params] - Optional query parameters to 
   * include in the request.
   * @param {*} [data] - Optional request body data, for POST, 
   * PUT, etc.
   * @returns {Promise<T>} A promise resolving to the response 
   * data of type `T`.
   * @throws {HttpException} Throws if the HTTP request fails, with 
   * the error details and status code.
   */
  private async requestLeaderApi<T>(
    method: RESTMethod,
    urlPart: string,
    token?: string,
    params?: object,
    data?: any,
  ): Promise<T> {
    const url = `${this.baseUrl}${urlPart}`;
    const safeToken = token ?? await this.authService.getAccessToken();
  
    try {
      const response = await firstValueFrom(
        this.httpService.request<T>({
          method,
          url,
          headers: {
            Authorization: `Bearer ${safeToken}`,
          },
          params: params,
          data: data,
        }),
      );
  
      this.logger.debug(`Leader API ${method} request to ${url} succeeded`);
      return response.data;
    } catch (error) {
      this.logger.warn(
        `Failed to ${method} Leader API request to URL: ${url}`,
        error?.response?.data || error.message,
      );
  
      const status =
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
  
      throw new HttpException(
        {
          message: `Leader API ${method} request failed for URL: ${url}`,
          details: error?.response?.data || error.message,
        },
        status,
      );
    }
  }
}