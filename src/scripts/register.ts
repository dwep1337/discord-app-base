import { registerCommands } from "../shared/utils/registerCommands";

registerCommands()
  .then(() => {
    console.log("✅ Comandos registrados!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });
