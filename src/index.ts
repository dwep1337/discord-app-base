import { Bot } from "./domain/entities/Bot";
import { GlobalExceptionHandler } from "./shared/utils/GlobalExceptionHandler";

async function main() {
  // Inicializa o handler global de exceções PRIMEIRO
  GlobalExceptionHandler.initialize();

  try {
    const bot = new Bot();
    await bot.start();
  } catch (error) {
    GlobalExceptionHandler.handleWithSuggestions(error, "main()");
    process.exit(1);
  }
}

main();
