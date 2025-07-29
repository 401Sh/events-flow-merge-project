export interface APIOAuthInterface<T> {
  exchangeСode(code: string): Promise<T>;
  refreshToken(refreshToken: string): Promise<T>;
}
