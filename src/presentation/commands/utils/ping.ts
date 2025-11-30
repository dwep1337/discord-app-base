import { Command } from "../../../core/entities/Command";
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export default class PingCommand extends Command {
  public data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Responde com Pong!");

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.reply({
      content: "🏓 Pong!",
    });

    const sent = await interaction.fetchReply();
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    await interaction.editReply(
      `🏓 Pong!\n📊 Latência: ${latency}ms\n🌐 API Latência: ${apiLatency}ms`
    );
  }
}
