export interface APIMapperInterface<T> {
  map(raw: any): Promise<T>;
}