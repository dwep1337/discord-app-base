import { Bot } from "../../domain/entities/Bot";
import { ClientEvents } from "discord.js";
import { GlobalExceptionHandler } from "../../shared/utils/GlobalExceptionHandler";

export class EventHandler {
  constructor(private bot: Bot) {}

  public async handle<K extends keyof ClientEvents>(
    eventName: K,
    ...args: ClientEvents[K]
  ): Promise<void> {
    // Usa o wrapper global para garantir que todos os erros sejam capturados
    await GlobalExceptionHandler.wrapAsync(async () => {
      const event = this.bot.getEventManager().get(String(eventName));

      if (!event) {
        return;
      }

      try {
        await event.execute(...(args as any[]));
      } catch (error) {
        GlobalExceptionHandler.handle(
          error,
          `EventHandler - ${String(eventName)}`
        );
      }
    }, `EventHandler - ${String(eventName)}`);
  }
}
