import { Injectable } from '@nestjs/common';
import { ApiRateLimiterService } from './api-rate-limiter.abstract.service';
import { TIMEPAD_RATE_LIMITS } from '../constants/api-rate-limits.constant';

@Injectable()
export class TimepadApiRateLimiterService extends ApiRateLimiterService {
  constructor() {
    super(TIMEPAD_RATE_LIMITS);
  }
}