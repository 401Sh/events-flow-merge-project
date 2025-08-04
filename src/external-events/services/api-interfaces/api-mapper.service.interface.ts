export interface APIMapperInterface<T> {
  /**
   * Maps a raw input object to a typed data transfer object asynchronously.
   *
   * @async
   * @param {any} raw - The raw input data to be mapped.
   * @returns {Promise<T>} A promise that resolves to the mapped data transfer
   * object of type T.
   */
  map(raw: any): Promise<T>;
}