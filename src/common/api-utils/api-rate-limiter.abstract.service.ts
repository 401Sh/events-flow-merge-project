import Bottleneck from 'bottleneck';

export abstract class ApiRateLimiterService {
  protected limiter: Bottleneck;

  constructor(rateLimits: {
    reservoir: number;
    reservoirRefreshAmount: number;
    reservoirRefreshInterval: number;
  }) {
    this.limiter = new Bottleneck({
      reservoir: rateLimits.reservoir,
      reservoirRefreshAmount: rateLimits.reservoirRefreshAmount,
      reservoirRefreshInterval: rateLimits.reservoirRefreshInterval,
    });
  }

  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    return this.limiter.schedule(fn);
  }
}