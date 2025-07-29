export interface APIOAuthInterface<T> {
  /**
   * Exchanges an authorization code for an access token and user data.
   *
   * Sends a POST request to the API token endpoint with the provided 
   * authorization code.
   *
   * @async
   * @param {string} code - The authorization code to exchange.
   * @returns {Promise<T>} A promise that resolves to the result data including 
   * access token and user information.
   */
  exchangeСode(code: string): Promise<T>;

  /**
   * Refreshes the access token using the provided refresh token.
   *
   * Sends a POST request to the API token endpoint with the given refresh token.
   *
   * @async
   * @param {string} refreshToken - The refresh token used to obtain a new 
   * access token.
   * @returns {Promise<T>} A promise that resolves to the result data including 
   * new tokens and user information.
   */
  refreshToken(refreshToken: string): Promise<T>;
}
