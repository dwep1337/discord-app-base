import { REST, Routes } from "discord.js";
import { Config } from "../../infrastructure/config/Config";
import { CommandManager } from "../../application/services/CommandManager";

export class CommandRegistrar {
  private config: Config;
  private commandManager: CommandManager;

  constructor() {
    this.config = Config.getInstance();
    this.commandManager = new CommandManager(__dirname);
  }

  public async register(): Promise<void> {
    await this.commandManager.load();
    const commands = this.commandManager.getAll();

    const commandsData = commands.map((command) => command.data.toJSON());

    const rest = new REST({ version: "10" }).setToken(this.config.token);

    try {
      console.log(
        `🔄 Registrando ${commandsData.length} comando(s) no Discord...`
      );

      const data: any = await rest.put(
        Routes.applicationCommands(this.config.clientId),
        { body: commandsData }
      );

      console.log(`✅ ${data.length} comando(s) registrado(s) com sucesso!`);
    } catch (error) {
      console.error("❌ Erro ao registrar comandos:", error);
      throw error;
    }
  }
}

export async function registerCommands(): Promise<void> {
  const registrar = new CommandRegistrar();
  await registrar.register();
}
