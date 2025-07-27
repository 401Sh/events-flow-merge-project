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
import { SubscribeParticipationResultDto } from "../dto/subscribe-participation-result.dto";

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


  async subscribeToEvent(token: any, userId: number) {
    const result = await this.requestLeaderApi<
      SubscribeParticipationResultDto
    >(
      RESTMethod.POST,
      `/users/${userId}/event-participations`,
      token,
    );

    return result;
  }


  async unsubscribeToEvent(token: any, userId: number, uuid: string) {
    const result = await this.requestLeaderApi<any>(
      RESTMethod.DELETE,
      `/users/${userId}/event-participations/${uuid}`,
      token,
    );

    return result;
  }


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