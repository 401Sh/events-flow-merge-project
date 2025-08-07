import { Injectable } from '@nestjs/common';
import { TIMEPAD_RATE_LIMITS } from 'src/common/constants/timepad-api-rate-limits.constant';
import { ApiRateLimiterService } from './api-rate-limiter.abstract.service';

@Injectable()
export class TimepadApiRateLimiterService extends ApiRateLimiterService {
  constructor() {
    super(TIMEPAD_RATE_LIMITS);
  }
}