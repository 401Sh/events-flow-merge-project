import { CallbackResultDto } from 'src/auth/dto/callback-result.dto';

export interface APIOAuthInterface {
  exchangeСode(code: string): Promise<CallbackResultDto>;
  refreshToken(refreshToken: string): Promise<CallbackResultDto>;
}
