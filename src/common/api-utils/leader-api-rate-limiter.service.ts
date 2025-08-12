import { Injectable } from '@nestjs/common';
import { LEADER_RATE_LIMITS } from '../constants/api-rate-limits.constant';
import { ApiRateLimiterService } from './api-rate-limiter.abstract.service';

@Injectable()
export class LeaderApiRateLimiterService extends ApiRateLimiterService {
  constructor() {
    super(LEADER_RATE_LIMITS);
  }
}