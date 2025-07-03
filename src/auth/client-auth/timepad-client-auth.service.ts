import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TimepadClientAuthService {
  constructor(private readonly configService: ConfigService) {}

  getAccessToken(): string {
    return this.configService.getOrThrow<string>('TIMEPAD_TOKEN');
  }
}
