import { Client } from "discord.js";
import { Config } from "../../infrastructure/config/Config";
import { CommandManager } from "../../application/services/CommandManager";
import { EventManager } from "../../application/services/EventManager";
import { EventHandler } from "../../presentation/handlers/EventHandler";
import { GlobalExceptionHandler } from "../../shared/utils/GlobalExceptionHandler";
import { RegisterCommandsUseCase } from "../../application/use-cases/commands/RegisterCommandsUseCase";
import { DiscordClientAdapter } from "../../infrastructure/discord/DiscordClientAdapter";

export class Bot extends Client {
  private config: Config;
  private commandManager: CommandManager;
  private eventManager: EventManager;
  private eventHandler: EventHandler;

  constructor() {
    const config = Config.getInstance();
    super({
      intents: config.intents,
      partials: config.partials,
    });

    this.config = config;
    this.eventHandler = new EventHandler(this);
    // Ajusta caminho: __dirname em runtime aponta para dist/domain/entities
    const basePath = __dirname.replace(/domain\/entities$/, "");
    this.commandManager = new CommandManager(basePath);
    this.eventManager = new EventManager(basePath, this, this.eventHandler);
  }

  public async start(): Promise<void> {
    try {
      console.log("🔄 Carregando módulos...");
      await this.commandManager.load();
      await this.eventManager.load();
      console.log("🔄 Conectando ao Discord...");
      await this.login(this.config.token);
    } catch (error) {
      GlobalExceptionHandler.handle(error, "Bot.start()");
      throw error;
    }
  }

  public getCommandManager(): CommandManager {
    return this.commandManager;
  }

  public getEventManager(): EventManager {
    return this.eventManager;
  }

  public getEventHandler(): EventHandler {
    return this.eventHandler;
  }

  public async registerCommands(): Promise<void> {
    const commands = this.commandManager.getAll();
    const discordClient = new DiscordClientAdapter();
    const registerCommandsUseCase = new RegisterCommandsUseCase(discordClient);

    try {
      await registerCommandsUseCase.execute(commands);
    } catch (error: any) {
      GlobalExceptionHandler.handleWithSuggestions(
        error,
        "Bot.registerCommands()"
      );
      throw error;
    }
  }
}
