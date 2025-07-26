import { APIUserInterface } from "./api-user.service.interface";
import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { LeaderClientAuthService } from "src/auth/client-auth/leader-client-auth.service";
import { GetParticipantsQueryDto } from "../dto/get-participants-query.dto";
import { mapLeaderVisited } from "../api-utils/visited-leader-map";
import { mapLeaderUser } from "../api-utils/user-profile-map";
// TODO: Сделать типизацию для библиотеки
import EditorJSParser from 'editorjs-parser';

@Injectable()
export class LeaderUserService implements APIUserInterface {
  private readonly logger = new Logger(LeaderUserService.name);
  private readonly baseUrl: string;

  private readonly editorJsParser = new EditorJSParser();

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: LeaderClientAuthService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('LEADER_API_URL');
  }

  async getUser(userId: number) {
    const rawUser = await this.fetchFromLeaderApi<{ data: any }>(
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

    const data = await this.fetchFromLeaderApi<LeaderResponseType>(
      `/users/${userId}/event-participations`,
      token,
      params,
    );
    console.dir(data)
    console.dir(data.items, {depth: 5})
    const rawEvents = data.items || [];
    const mappedEvents = rawEvents.map((e) => 
      mapLeaderVisited(e, this.editorJsParser)
    );

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
    completed: boolean,
  ) {
    if (completed) {
      return await this.getVisitedUserEvents(token, userId);
    }

    return await this.getFutureUserEvents(token, userId);
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
  
      const data = await this.fetchFromLeaderApi<LeaderResponseType>(
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
  
      const data = await this.fetchFromLeaderApi<LeaderResponseType>(
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


  private async fetchFromLeaderApi<T>(
    urlPart: string,
    token?: string,
    params?: object,
  ): Promise<T> {
    const url = `${this.baseUrl}${urlPart}`;

    const safeToken = token ? token : await this.authService.getAccessToken();

    try {
      const response = await firstValueFrom(
        this.httpService.get<T>(url, {
          headers: {
            Authorization: `Bearer ${safeToken}`,
          },
          params: params,
        }),
      );

      this.logger.debug(`Leader API request to ${url} succeeded`);

      return response.data;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch from Leader API URL: ${url}`,
        error?.response?.data || error.message,
      );

      const status =
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          message: `Leader API request failed for URL: ${url}`,
          details: error?.response?.data || error.message,
        },
        status,
      );
    }
  }
}