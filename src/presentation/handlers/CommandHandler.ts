import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { Bot } from "../../domain/entities/Bot";
import { GlobalExceptionHandler } from "../../shared/utils/GlobalExceptionHandler";

export class CommandHandler {
  constructor(private bot: Bot) {}

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    // Usa o wrapper global para garantir que todos os erros sejam capturados
    await GlobalExceptionHandler.wrapAsync(async () => {
      const command = this.bot.getCommandManager().get(interaction.commandName);

      if (!command) {
        await interaction.reply({
          content: "❌ Comando não encontrado!",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        GlobalExceptionHandler.handle(
          error,
          `CommandHandler - ${command.name}`
        );

        const errorMessage = GlobalExceptionHandler.getUserFriendlyMessage(
          error,
          "❌ Ocorreu um erro ao executar este comando!"
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
            "CommandHandler - Enviar mensagem de erro"
          );
        }
      }
    }, `CommandHandler - ${interaction.commandName}`);
  }
}
