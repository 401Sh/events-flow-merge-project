import Bottleneck from 'bottleneck';
import { Injectable } from '@nestjs/common';
import { LEADER_RATE_LIMITS } from 'src/constants/leader-api-rate-limits.constant';

@Injectable()
export class LeaderApiRateLimiterService {
  private limiter: Bottleneck;

  constructor() {
    this.limiter = new Bottleneck({
      reservoir: LEADER_RATE_LIMITS.reservoir,
      reservoirRefreshAmount: LEADER_RATE_LIMITS.reservoirRefreshAmount,
      reservoirRefreshInterval: LEADER_RATE_LIMITS.reservoirRefreshInterval,
    });
  }

  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    return this.limiter.schedule(fn);
  }
}