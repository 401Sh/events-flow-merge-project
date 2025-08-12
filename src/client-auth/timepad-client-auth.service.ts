import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TimepadClientAuthService {
  readonly apiToken: string;

  constructor(private readonly configService: ConfigService) {
    this.apiToken = this.configService.getOrThrow<string>('TIMEPAD_TOKEN');
  }
}