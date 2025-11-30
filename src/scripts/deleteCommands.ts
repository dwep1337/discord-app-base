import { REST, Routes } from "discord.js";
import { Config } from "../infrastructure/config/Config";

async function deleteAllCommands(): Promise<void> {
  const config = Config.getInstance();
  const rest = new REST({ version: "10" }).setToken(config.token);

  try {
    console.log("🔄 Buscando comandos registrados...");

    const commands: any = await rest.get(
      Routes.applicationCommands(config.clientId)
    );

    if (Array.isArray(commands) && commands.length > 0) {
      console.log(
        `📋 Encontrados ${commands.length} comando(s) para deletar...`
      );

      await rest.put(Routes.applicationCommands(config.clientId), { body: [] });

      console.log(`✅ Todos os ${commands.length} comando(s) foram deletados!`);
    } else {
      console.log("ℹ️ Nenhum comando encontrado para deletar.");
    }
  } catch (error: any) {
    console.error("❌ Erro ao deletar comandos:", error.message || error);
    throw error;
  }
}

deleteAllCommands()
  .then(() => {
    console.log("✅ Processo concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });
