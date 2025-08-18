import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LeaderResponseType } from "src/external-events/types/leader-response.type";
import { RESTMethod } from "../enums/rest-method.enum";
import { LEADER_EVENT_MAX_AMOUNT } from "src/common/constants/leader-request.constant";
import { LeaderClientAuthService } from "src/client-auth/leader-client-auth.service";
import { LeaderApiRateLimiterService } from "src/common/api-utils/leader-api-rate-limiter.service";
import { firstValueFrom } from "rxjs";

@Injectable()
export class LeaderUserFetchService {
  private readonly logger = new Logger(LeaderUserFetchService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: LeaderClientAuthService,
    private readonly rateLimiter: LeaderApiRateLimiterService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('LEADER_API_URL');
  }


  /**
   * Fetches a paginated list of visited event participations from the leader API.
   *
   * Sends an HTTP GET request to retrieve one page of event participations for 
   * a specific user, including pagination parameters such as page number and 
   * page size.
   *
   * This method requires an authorization token and user ID to query the API.
   *
   * @async
   * @param {string} token - Authorization token for accessing the API.
   * @param {number} userId - The ID of the user whose event participations are 
   * being fetched.
   * @param {number} page - The page number to fetch, used for pagination.
   * @returns {Promise<LeaderResponseType>} A promise resolving to the response 
   * containing the list of event participations and pagination metadata.
   * @private
   */
  async fetchVisitedEventPage(
    token: string,
    userId: number,
    page: number
  ): Promise<LeaderResponseType> {
    return await this.requestLeaderApi(
      RESTMethod.GET,
      `/users/${userId}/event-participations`,
      token,
      {
        paginationSize: LEADER_EVENT_MAX_AMOUNT,
        paginationPage: page,
      },
    );
  }


  /**
   * Sends an HTTP request to the leader API with the specified method, URL,
   * and optional parameters, applying rate limiting to control request throughput.
   *
   * Automatically attaches the authorization token, either from the provided
   * token or via the auth service.
   *
   * Requests are executed through a Bottleneck rate limiter to ensure that
   * outgoing requests conform to configured rate limits.
   *
   * Handles errors by logging and throwing an appropriate HTTP exception.
   *
   * @async
   * @template T - The expected response data type.
   * @param {RESTMethod} method - The HTTP method to use for the request
   * (GET, POST, DELETE, etc.).
   * @param {string} urlPart - The URL path appended to the base URL for the
   * leader API.
   * @param {string} [token] - Optional authorization token; if omitted,
   * fetches token from auth service.
   * @param {object} [params] - Optional query parameters to include in the
   * request.
   * @param {*} [data] - Optional request body data, for POST, PUT, etc.
   * @returns {Promise<T>} A promise resolving to the response data of type `T`.
   * @throws {HttpException} Throws if the HTTP request fails, with the error
   * details and status code.
   * @private
   */
  async requestLeaderApi<T>(
    method: RESTMethod,
    urlPart: string,
    token?: string,
    params?: object,
    data?: any,
  ): Promise<T> {
    const url = `${this.baseUrl}${urlPart}`;
    const safeToken = token ?? (await this.authService.getAccessToken());

    return this.rateLimiter.schedule(async () => {
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
    });
  }
}