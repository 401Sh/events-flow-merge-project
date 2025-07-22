import { UnifiedEventDto } from "src/events/dto/unified-event.dto";
import { AbstractLeaderUserRepository } from "./abstract-leader-user.repository";
import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { LeaderClientAuthService } from "src/auth/client-auth/leader-client-auth.service";
import { GetParticipantsQueryDto } from "../dto/get-participants-query.dto";
import { mapLeaderVisited } from "../api-utils/visited-leader-map";
import { mapLeaderUser } from "../api-utils/user-profile-map";

@Injectable()
export class LeaderUserRepository extends AbstractLeaderUserRepository {
  private readonly logger = new Logger(LeaderUserRepository.name);
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: LeaderClientAuthService,
  ) {
    super();
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
  
  
  async getUserParticipations(userId: number, query: GetParticipantsQueryDto) {
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
      };
    };

    const data = await this.fetchFromLeaderApi<LeaderResponseType>(
      `/users/${userId}/event-participations`,
      params,
    );
    console.dir(data)
    console.dir(data.items, {depth: 5})
    const rawEvents = data.items || [];
    const mappedEvents = rawEvents.map(mapLeaderVisited);

    this.logger.debug('Leader event list recieved successfully');

    const dataWithMeta = {
      data: mappedEvents,
      meta: {
        totalEventsAmount: data.meta.totalCount,
        totalPagesAmount: data.meta.paginationPageCount,
        currentPage: page,
      },
    };

    return dataWithMeta;
  }


  private async fetchFromLeaderApi<T>(
    urlPart: string,
    params?: object,
  ): Promise<T> {
    const url = `${this.baseUrl}${urlPart}`;

    const token = await this.authService.getAccessToken();

    try {
      const response = await firstValueFrom(
        this.httpService.get<T>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
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