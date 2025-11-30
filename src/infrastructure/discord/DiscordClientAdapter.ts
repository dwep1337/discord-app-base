import { REST, Routes } from "discord.js";
import { IDiscordClient } from "../../core/types/IDiscordClient";
import { Config } from "../config/Config";

/**
 * Adapter para interações com a API do Discord
 */
export class DiscordClientAdapter implements IDiscordClient {
  private rest: REST;
  private config: Config;

  constructor() {
    this.config = Config.getInstance();
    this.rest = new REST({ version: "10" }).setToken(this.config.token);
  }

  public async registerGlobalCommands(
    clientId: string,
    commands: any[]
  ): Promise<any[]> {
    const data: any = await this.rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    return data;
  }

  public async registerGuildCommands(
    clientId: string,
    guildId: string,
    commands: any[]
  ): Promise<any[]> {
    const data: any = await this.rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    return data;
  }

  public async deleteGlobalCommands(clientId: string): Promise<void> {
    await this.rest.put(Routes.applicationCommands(clientId), { body: [] });
  }

  public async deleteGuildCommands(
    clientId: string,
    guildId: string
  ): Promise<void> {
    await this.rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: [],
    });
  }

  public async getGlobalCommands(clientId: string): Promise<any[]> {
    try {
      const commands: any = await this.rest.get(
        Routes.applicationCommands(clientId)
      );
      return Array.isArray(commands) ? commands : [];
    } catch (error) {
      return [];
    }
  }

  public async getGuildCommands(
    clientId: string,
    guildId: string
  ): Promise<any[]> {
    try {
      const commands: any = await this.rest.get(
        Routes.applicationGuildCommands(clientId, guildId)
      );
      return Array.isArray(commands) ? commands : [];
    } catch (error) {
      return [];
    }
  }

  public getRestClient(): REST {
    return this.rest;
  }
}
