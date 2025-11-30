import { IDiscordClient } from "../../../core/types/IDiscordClient";
import { Command } from "../../../core/entities/Command";
import { Collection } from "discord.js";
import { Config } from "../../../infrastructure/config/Config";
import { GlobalExceptionHandler } from "../../../shared/utils/GlobalExceptionHandler";

export class RegisterCommandsUseCase {
  private discordClient: IDiscordClient;
  private config: Config;

  constructor(discordClient: IDiscordClient) {
    this.discordClient = discordClient;
    this.config = Config.getInstance();
  }

  public async execute(commands: Collection<string, Command>): Promise<void> {
    if (commands.size === 0) {
      console.warn("⚠️ Nenhum comando encontrado para registrar!");
      return;
    }

    const commandsData = commands.map((command) => command.data.toJSON());

    try {
      // Se estiver registrando em servidor específico, registra APENAS lá
      // Caso contrário, registra globalmente
      if (this.config.registerGuildCommands && this.config.testGuildId) {
        const existingCommands = await this.discordClient.getGuildCommands(
          this.config.clientId,
          this.config.testGuildId
        );

        if (this.hasCommandsChanged(existingCommands, commandsData)) {
          await this.discordClient.deleteGuildCommands(
            this.config.clientId,
            this.config.testGuildId
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));

          await this.discordClient.registerGuildCommands(
            this.config.clientId,
            this.config.testGuildId,
            commandsData
          );
          console.log(
            `✅ ${commands.size} comando(s) registrado(s) no servidor de teste`
          );
        } else {
          console.log(
            `ℹ️ Comandos já estão atualizados no servidor de teste (${commands.size} comando(s))`
          );
        }
      } else {
        const existingCommands = await this.discordClient.getGlobalCommands(
          this.config.clientId
        );

        if (this.hasCommandsChanged(existingCommands, commandsData)) {
          await this.discordClient.deleteGlobalCommands(this.config.clientId);
          await new Promise((resolve) => setTimeout(resolve, 1000));

          await this.discordClient.registerGlobalCommands(
            this.config.clientId,
            commandsData
          );
          console.log(
            `✅ ${commands.size} comando(s) global(is) registrado(s)`
          );
        } else {
          console.log(
            `ℹ️ Comandos já estão atualizados globalmente (${commands.size} comando(s))`
          );
        }
      }
    } catch (error) {
      GlobalExceptionHandler.handleWithSuggestions(
        error,
        "RegisterCommandsUseCase"
      );
      throw error;
    }
  }

  /**
   * Compara comandos existentes com os novos para verificar se houve alterações
   */
  private hasCommandsChanged(
    existingCommands: any[],
    newCommands: any[]
  ): boolean {
    // Se a quantidade mudou, precisa atualizar
    if (existingCommands.length !== newCommands.length) {
      return true;
    }

    // Cria um mapa dos comandos existentes por nome
    const existingMap = new Map<string, any>();
    existingCommands.forEach((cmd) => {
      existingMap.set(cmd.name, cmd);
    });

    // Compara cada comando novo com o existente
    for (const newCmd of newCommands) {
      const existingCmd = existingMap.get(newCmd.name);

      // Se o comando não existe, precisa atualizar
      if (!existingCmd) {
        return true;
      }

      // Compara as propriedades principais
      if (
        existingCmd.description !== newCmd.description ||
        JSON.stringify(existingCmd.options || []) !==
          JSON.stringify(newCmd.options || [])
      ) {
        return true;
      }
    }

    // Nenhuma alteração detectada
    return false;
  }
}
