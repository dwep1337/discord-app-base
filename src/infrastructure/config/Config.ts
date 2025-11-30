import { config } from "dotenv";
import { GatewayIntentBits, Partials } from "discord.js";
import { IConfig } from "../../core/types";

config();

export class Config implements IConfig {
  private static instance: Config;
  public readonly token: string;
  public readonly clientId: string;
  public readonly intents: number[];
  public readonly partials: number[];
  public readonly registerGuildCommands: boolean;
  public readonly testGuildId?: string;

  private constructor() {
    this.token = process.env.DISCORD_TOKEN || "";
    this.clientId = process.env.CLIENT_ID || "";

    if (!this.token) {
      throw new Error("DISCORD_TOKEN não encontrado no arquivo .env");
    }

    if (!this.clientId) {
      throw new Error("CLIENT_ID não encontrado no arquivo .env");
    }

    this.intents = [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ];

    this.partials = [Partials.Channel, Partials.Message];

    this.registerGuildCommands = process.env.REGISTER_GUILD_COMMANDS === "true";
    this.testGuildId = process.env.TEST_GUILD_ID || undefined;
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }
}
