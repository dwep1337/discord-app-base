import { Event } from "../../core/entities/Event";
import { Interaction } from "discord.js";
import { Bot } from "../../domain/entities/Bot";
import { CommandHandler } from "../handlers/CommandHandler";

export default class InteractionCreateEvent extends Event {
  constructor() {
    super("interactionCreate", false);
  }

  public async execute(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const bot = interaction.client as Bot;
    const commandHandler = new CommandHandler(bot);
    await commandHandler.handle(interaction);
  }
}
