export abstract class Event {
  public readonly name: string;
  public readonly once: boolean;

  constructor(name: string, once: boolean = false) {
    this.name = name;
    this.once = once;
  }

  public abstract execute(...args: any[]): Promise<void> | void;
}
