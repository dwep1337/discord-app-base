import { Event } from "../../core/entities/Event";
import { Message } from "discord.js";

export default class MessageCreateEvent extends Event {
  constructor() {
    super("messageCreate", false);
  }

  public async execute(message: Message): Promise<void> {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === "olá") {
      await message.reply("Olá! Como posso ajudar?");
    }
  }
}
