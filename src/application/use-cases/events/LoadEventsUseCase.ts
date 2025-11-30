import { Event } from "../../../core/entities/Event";
import { Loader } from "../../../shared/utils/Loader";
import { Bot } from "../../../domain/entities/Bot";
import { EventHandler } from "../../../presentation/handlers/EventHandler";
import { GlobalExceptionHandler } from "../../../shared/utils/GlobalExceptionHandler";

export class LoadEventsUseCase {
  private loader: Loader;
  private client: Bot;
  private eventHandler: EventHandler;

  constructor(basePath: string, client: Bot, eventHandler: EventHandler) {
    this.loader = new Loader(basePath);
    this.client = client;
    this.eventHandler = eventHandler;
  }

  public async execute(): Promise<void> {
    const events = await this.loader.loadFromDirectory<Event>(
      "presentation/events",
      (file: string) => file.endsWith(".js")
    );

    for (const eventClass of events) {
      try {
        let event: Event;

        if (typeof eventClass === "function") {
          event = new (eventClass as new () => Event)();
        } else if (eventClass instanceof Event) {
          event = eventClass;
        } else {
          continue;
        }

        if (event && event instanceof Event) {
          const eventName = event.name;
          if (event.once) {
            this.client.once(eventName as any, (...args: any[]) => {
              this.eventHandler.handle(eventName as any, ...(args as any));
            });
          } else {
            this.client.on(eventName as any, (...args: any[]) => {
              this.eventHandler.handle(eventName as any, ...(args as any));
            });
          }
        }
      } catch (error) {
        GlobalExceptionHandler.handle(
          error,
          "LoadEventsUseCase - Instanciar evento"
        );
      }
    }

    if (events.length > 0) {
      console.log(`✅ ${events.length} evento(s) carregado(s)`);
    }
  }
}
