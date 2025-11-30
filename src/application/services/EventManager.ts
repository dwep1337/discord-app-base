import { Collection, ClientEvents } from "discord.js";
import { Event } from "../../core/entities/Event";
import { IManager } from "../../core/types";
import { Loader } from "../../shared/utils/Loader";
import { EventHandler } from "../../presentation/handlers/EventHandler";
import { Bot } from "../../domain/entities/Bot";
import { GlobalExceptionHandler } from "../../shared/utils/GlobalExceptionHandler";

export class EventManager implements IManager<Event> {
  private events: Collection<string, Event> = new Collection();
  private loader: Loader;
  private eventHandler: EventHandler;
  private client: Bot;

  constructor(basePath: string, client: Bot, eventHandler: EventHandler) {
    this.loader = new Loader(basePath);
    this.client = client;
    this.eventHandler = eventHandler;
  }

  public async load(): Promise<void> {
    const events = await this.loader.loadFromDirectory<Event>(
      "presentation/events",
      (file: string) => file.endsWith(".js")
    );

    for (const EventClass of events) {
      try {
        if (typeof EventClass === "function") {
          const event = new (EventClass as new () => Event)();

          if (event instanceof Event) {
            const eventName = event.name;
            const eventNameTyped = eventName as keyof ClientEvents;

            if (event.once) {
              this.client.once(
                eventNameTyped,
                (...args: ClientEvents[typeof eventNameTyped]) => {
                  this.eventHandler.handle(eventNameTyped, ...args);
                }
              );
            } else {
              this.client.on(
                eventNameTyped,
                (...args: ClientEvents[typeof eventNameTyped]) => {
                  this.eventHandler.handle(eventNameTyped, ...args);
                }
              );
            }

            this.events.set(String(eventName), event);
          }
        } else if (EventClass instanceof Event) {
          const event = EventClass;
          const eventName = event.name;
          const eventNameTyped = eventName as keyof ClientEvents;

          if (event.once) {
            this.client.once(
              eventNameTyped,
              (...args: ClientEvents[typeof eventNameTyped]) => {
                this.eventHandler.handle(eventNameTyped, ...args);
              }
            );
          } else {
            this.client.on(
              eventNameTyped,
              (...args: ClientEvents[typeof eventNameTyped]) => {
                this.eventHandler.handle(eventNameTyped, ...args);
              }
            );
          }

          this.events.set(String(eventName), event);
        }
      } catch (error: any) {
        GlobalExceptionHandler.handle(
          error,
          "EventManager - Instanciar evento"
        );
      }
    }

    if (this.events.size > 0) {
      console.log(`✅ ${this.events.size} evento(s) registrado(s)`);
    }
  }

  public get(name: string): Event | undefined {
    return this.events.get(name);
  }

  public getAll(): Collection<string, Event> {
    return this.events;
  }

  public has(name: string): boolean {
    return this.events.has(name);
  }

  public set(name: string, event: Event): void {
    this.events.set(name, event);
  }

  public delete(name: string): boolean {
    return this.events.delete(name);
  }

  public size(): number {
    return this.events.size;
  }
}
