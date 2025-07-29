import { CallbackResultDto } from 'src/auth/dto/callback-result.dto';

export interface APIOAuthInterface {
  /**
   * Exchanges an authorization code for an access token and user data.
   *
   * Sends a POST request to the API token endpoint with the authorization code.
   *
   * @async
   * @param {string} code - The authorization code to exchange.
   * @returns {Promise<CallbackResultDto>} A promise that resolves to data 
   * including access token and user validation info.
   */
  exchangeСode(code: string): Promise<CallbackResultDto>;

  /**
   * Refreshes the access token using the provided refresh token.
   *
   * Sends a POST request to the API token endpoint with the refresh token.
   *
   * @async
   * @param {string} refreshToken - The refresh token used to obtain a new 
   * access token.
   * @returns {Promise<CallbackResultDto>} A promise that resolves to data 
   * including new tokens and user validation info.
   */
  refreshToken(refreshToken: string): Promise<CallbackResultDto>;
}
