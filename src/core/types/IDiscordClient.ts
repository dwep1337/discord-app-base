import { REST } from "discord.js";

/**
 * Interface para o adapter do cliente Discord
 */
export interface IDiscordClient {
  /**
   * Registra comandos globalmente
   */
  registerGlobalCommands(clientId: string, commands: any[]): Promise<any[]>;

  /**
   * Registra comandos em um servidor específico
   */
  registerGuildCommands(
    clientId: string,
    guildId: string,
    commands: any[]
  ): Promise<any[]>;

  /**
   * Remove todos os comandos globais
   */
  deleteGlobalCommands(clientId: string): Promise<void>;

  /**
   * Remove todos os comandos de um servidor
   */
  deleteGuildCommands(clientId: string, guildId: string): Promise<void>;

  /**
   * Busca comandos globais registrados
   */
  getGlobalCommands(clientId: string): Promise<any[]>;

  /**
   * Busca comandos de um servidor específico
   */
  getGuildCommands(clientId: string, guildId: string): Promise<any[]>;

  /**
   * Obtém instância do REST client
   */
  getRestClient(): REST;
}
