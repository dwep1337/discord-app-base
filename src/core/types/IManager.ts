import { Collection } from "discord.js";

export interface IManager<T> {
  load(): Promise<void>;
  get(name: string): T | undefined;
  getAll(): Collection<string, T>;
  has(name: string): boolean;
  set(name: string, item: T): void;
  delete(name: string): boolean;
  size(): number;
}
