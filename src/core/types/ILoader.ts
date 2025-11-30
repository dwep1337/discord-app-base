export interface ILoader {
  loadFromDirectory<T>(
    directory: string,
    filter: (file: string) => boolean
  ): Promise<T[]>;
}
