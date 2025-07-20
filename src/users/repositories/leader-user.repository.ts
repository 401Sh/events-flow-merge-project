import { UnifiedEventDto } from "src/events/dto/unified-event.dto";
import { AbstractLeaderUserRepository } from "./abstract-leader-user.repository";
import { HttpException, HttpStatus, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { LeaderClientAuthService } from "src/auth/client-auth/leader-client-auth.service";

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
  
  getUserParticipations(): Promise<UnifiedEventDto> {
    throw new Error("Method not implemented.");
  }


  private async fetchFromLeaderApi<T>(urlPart: string): Promise<T> {
    const url = `${this.baseUrl}${urlPart}`;

    const token = await this.authService.getAccessToken();

    try {
      const response = await firstValueFrom(
        this.httpService.get<T>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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