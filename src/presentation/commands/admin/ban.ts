import { Command } from "../../../core/entities/Command";
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import { GlobalExceptionHandler } from "../../../shared/utils/GlobalExceptionHandler";

export default class BanCommand extends Command {
  public data = new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bane um usuário do servidor")
    .addUserOption((option) =>
      option
        .setName("usuário")
        .setDescription("O usuário a ser banido")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("motivo")
        .setDescription("Motivo do banimento")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "❌ Este comando só pode ser usado em servidores!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const user = interaction.options.getUser("usuário", true);
    const reason =
      interaction.options.getString("motivo") || "Sem motivo especificado";

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
      await interaction.reply({
        content: "❌ Você não tem permissão para banir usuários!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await interaction.guild!.members.ban(user, { reason });
      await interaction.reply({
        content: `✅ ${user.tag} foi banido do servidor!\n📝 Motivo: ${reason}`,
      });
    } catch (error) {
      GlobalExceptionHandler.handle(
        error,
        `BanCommand.execute() - ${user.tag}`
      );

      const errorMessage = GlobalExceptionHandler.getUserFriendlyMessage(
        error,
        "❌ Não foi possível banir o usuário."
      );

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: errorMessage,
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await interaction.reply({
            content: errorMessage,
            flags: MessageFlags.Ephemeral,
          });
        }
      } catch (replyError) {
        GlobalExceptionHandler.handleSilently(
          replyError,
          "BanCommand - Enviar mensagem de erro"
        );
      }
    }
  }
}
