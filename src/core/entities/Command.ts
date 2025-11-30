import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";

export abstract class Command {
  public abstract data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;

  public abstract execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> | void;

  public get name(): string {
    return this.data.name;
  }
}
