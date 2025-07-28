import { LeaderCallbackResponse } from "src/auth/interfaces/leader-callback-response.interface";

export interface APIOAuthInterface {
  exchangeСode(code: string): Promise<LeaderCallbackResponse>;
  refreshToken(refreshToken: string): Promise<LeaderCallbackResponse>;
}
