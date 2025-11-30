import { Event } from "../../core/entities/Event";
import { Client } from "discord.js";
import { Bot } from "../../domain/entities/Bot";
import { ResourceMonitor } from "../../shared/utils/ResourceMonitor";
import { GlobalExceptionHandler } from "../../shared/utils/GlobalExceptionHandler";

let monitor: ResourceMonitor | null = null;

export default class ReadyEvent extends Event {
  constructor() {
    super("clientReady", true);
  }

  public async execute(client: Client): Promise<void> {
    const bot = client as Bot;

    console.log(`✅ Bot conectado: ${client.user?.tag}`);
    console.log(
      `📊 Servidores: ${client.guilds.cache.size} | Usuários: ${client.users.cache.size}`
    );

    try {
      await bot.registerCommands();
    } catch (error) {
      GlobalExceptionHandler.handle(error, "ReadyEvent - Registrar comandos");
    }

    if (!monitor) {
      monitor = new ResourceMonitor(2000);
      await monitor.start();

      if (process.listenerCount("SIGINT") === 0) {
        process.on("SIGINT", () => {
          console.log("\n\n🛑 Encerrando bot...");
          if (monitor) monitor.stop();
          process.exit(0);
        });
      }

      if (process.listenerCount("SIGTERM") === 0) {
        process.on("SIGTERM", () => {
          console.log("\n\n🛑 Encerrando bot...");
          if (monitor) monitor.stop();
          process.exit(0);
        });
      }
    }
  }
}
