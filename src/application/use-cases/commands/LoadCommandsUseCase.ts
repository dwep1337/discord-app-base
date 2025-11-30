import { Command } from "../../../core/entities/Command";
import { Collection } from "discord.js";
import { Loader } from "../../../shared/utils/Loader";
import { GlobalExceptionHandler } from "../../../shared/utils/GlobalExceptionHandler";

export class LoadCommandsUseCase {
  private loader: Loader;

  constructor(basePath: string) {
    this.loader = new Loader(basePath);
  }

  public async execute(): Promise<Collection<string, Command>> {
    const commands = new Collection<string, Command>();

    const commandsData =
      await this.loader.loadFromDirectoryWithCategory<Command>(
        "presentation/commands",
        (file: string) => file.endsWith(".js")
      );

    for (const { module: commandClass } of commandsData) {
      try {
        let command: Command;

        if (typeof commandClass === "function") {
          command = new (commandClass as new () => Command)();
        } else if (commandClass instanceof Command) {
          command = commandClass;
        } else {
          continue;
        }

        if (command && command instanceof Command) {
          if (commands.has(command.name)) {
            console.warn(`⚠️ Comando duplicado ignorado: ${command.name}`);
            continue;
          }
          commands.set(command.name, command);
        }
      } catch (error) {
        GlobalExceptionHandler.handle(
          error,
          "LoadCommandsUseCase - Instanciar comando"
        );
      }
    }

    if (commands.size > 0) {
      const commandNames = Array.from(commands.keys()).join(", ");
      console.log(
        `✅ ${commands.size} comando(s) carregado(s): ${commandNames}`
      );
    }

    return commands;
  }
}
