import { CallbackResultDto } from 'src/auth/dto/callback-result.dto';

export abstract class AbstractLeaderOAuthRepository {
  abstract exchangeСode(code: string): Promise<CallbackResultDto>;
  abstract refreshToken(refreshToken: string): Promise<CallbackResultDto>;
}
