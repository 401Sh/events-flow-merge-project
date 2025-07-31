import Bottleneck from 'bottleneck';
import { Injectable } from '@nestjs/common';
import { TIMEPAD_RATE_LIMITS } from 'src/constants/timepad-api-rate-limits.constant';

@Injectable()
export class TimepadApiRateLimiterService {
  private limiter: Bottleneck;

  constructor() {
    this.limiter = new Bottleneck({
      reservoir: TIMEPAD_RATE_LIMITS.reservoir,
      reservoirRefreshAmount: TIMEPAD_RATE_LIMITS.reservoirRefreshAmount,
      reservoirRefreshInterval: TIMEPAD_RATE_LIMITS.reservoirRefreshInterval,
    });
  }

  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    return this.limiter.schedule(fn);
  }
}