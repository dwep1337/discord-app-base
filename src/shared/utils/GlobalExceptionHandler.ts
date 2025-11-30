import { DiscordAPIError, HTTPError } from "discord.js";
import { DiscordErrorCodes } from "./errors/DiscordErrorCodes";
import { ERROR_MESSAGES } from "./errors/ErrorMessages";

export class GlobalExceptionHandler {
  private static initialized: boolean = false;

  private static createTable(
    rows: Array<{ key: string; value: string }>
  ): string {
    if (rows.length === 0) return "";

    const maxKeyLength = Math.max(...rows.map((r) => r.key.length));
    const maxValueLength = Math.max(...rows.map((r) => r.value.length));
    const keyWidth = Math.max(maxKeyLength, 15);
    const valueWidth = Math.max(maxValueLength, 20);

    let table =
      "┌" + "─".repeat(keyWidth + 2) + "┬" + "─".repeat(valueWidth + 2) + "┐\n";
    table +=
      "│ " +
      "Campo".padEnd(keyWidth) +
      " │ " +
      "Valor".padEnd(valueWidth) +
      " │\n";
    table +=
      "├" + "─".repeat(keyWidth + 2) + "┼" + "─".repeat(valueWidth + 2) + "┤\n";

    rows.forEach((row) => {
      const key = row.key.padEnd(keyWidth);
      const value = row.value.substring(0, valueWidth).padEnd(valueWidth);
      table += "│ " + key + " │ " + value + " │\n";
    });

    table +=
      "└" + "─".repeat(keyWidth + 2) + "┴" + "─".repeat(valueWidth + 2) + "┘\n";
    return table;
  }

  public static initialize(): void {
    if (this.initialized) {
      console.warn("⚠️ GlobalExceptionHandler já foi inicializado");
      return;
    }

    process.on("uncaughtException", (error: Error) => {
      this.handle(error, "uncaughtException (Global)");

      setTimeout(() => {
        console.error("💀 Encerrando processo devido a erro não tratado...");
        process.exit(1);
      }, 1000);
    });

    process.on("unhandledRejection", (reason: unknown) => {
      const error =
        reason instanceof Error ? reason : new Error(String(reason));

      this.handle(error, "unhandledRejection (Global)");
    });

    process.on("rejectionHandled", () => {
      console.warn("⚠️ Uma promise rejeitada foi tratada posteriormente");
    });

    process.on("warning", (warning: Error) => {
      this.handleSilently(warning, "Node.js Warning");
    });

    this.initialized = true;
    console.log("✅ GlobalExceptionHandler inicializado");
  }

  public static handle(error: unknown, context?: string): void {
    const errorMessage = this.formatError(error, context);
    console.error(errorMessage);
  }

  public static formatError(error: unknown, context?: string): string {
    let message = "\n";
    message += "┌─────────────────────────────────────────────────────────┐\n";
    message += "│              ❌ ERRO DETECTADO                           │\n";
    message +=
      "└─────────────────────────────────────────────────────────┘\n\n";

    const rows: Array<{ key: string; value: string }> = [];

    if (context) {
      rows.push({ key: "📍 Contexto", value: context });
    }

    if (error instanceof Error) {
      rows.push({ key: "🔴 Tipo", value: error.constructor.name });
      rows.push({ key: "📝 Mensagem", value: error.message });

      if (error instanceof DiscordAPIError) {
        message += this.formatDiscordError(error);
      } else if (error instanceof HTTPError) {
        message += this.formatHTTPError(error);
      } else {
        const errorAny = error as any;
        if (errorAny.code && errorAny.status) {
          const discordRows: Array<{ key: string; value: string }> = [];
          discordRows.push({ key: "Código", value: String(errorAny.code) });
          discordRows.push({ key: "Status", value: String(errorAny.status) });
          if (errorAny.method) {
            discordRows.push({ key: "Método", value: errorAny.method });
          }
          if (errorAny.url) {
            discordRows.push({ key: "URL", value: errorAny.url });
          }
          if (
            errorAny.status &&
            ERROR_MESSAGES[errorAny.status as DiscordErrorCodes]
          ) {
            discordRows.push({
              key: "💡 Explicação",
              value: ERROR_MESSAGES[errorAny.status as DiscordErrorCodes],
            });
          }
          message += "\n🌐 Erro da API do Discord:\n";
          message += this.createTable(discordRows);
        }
      }

      if (error.stack) {
        const stackLines = error.stack.split("\n").slice(0, 5);
        const stackRows: Array<{ key: string; value: string }> = [];
        stackLines.forEach((line, index) => {
          if (index > 0) {
            const cleanLine = line.trim();
            stackRows.push({
              key: `Linha ${index}`,
              value: cleanLine.substring(0, 80),
            });
          }
        });
        if (stackRows.length > 0) {
          message += "\n📚 Stack Trace (primeiras linhas):\n";
          message += this.createTable(stackRows);
        }
      }
    } else if (typeof error === "string") {
      rows.push({ key: "📝 Erro", value: error });
    } else {
      rows.push({
        key: "📝 Erro",
        value: JSON.stringify(error).substring(0, 100),
      });
    }

    if (rows.length > 0) {
      message += this.createTable(rows);
    }

    message += "\n";
    return message;
  }

  private static formatDiscordError(error: DiscordAPIError): string {
    const rows: Array<{ key: string; value: string }> = [];
    rows.push({ key: "Código", value: String(error.code) });
    rows.push({ key: "Status", value: String(error.status) });
    rows.push({ key: "Método", value: error.method });

    const errorAny = error as any;
    if (errorAny.path) {
      rows.push({ key: "Path", value: errorAny.path });
    }

    if (errorAny.requestData) {
      rows.push({
        key: "Request Data",
        value: JSON.stringify(errorAny.requestData).substring(0, 80),
      });
    }

    if (error.status && ERROR_MESSAGES[error.status as DiscordErrorCodes]) {
      rows.push({
        key: "💡 Explicação",
        value: ERROR_MESSAGES[error.status as DiscordErrorCodes],
      });
    }

    let message = "\n🌐 Erro da API do Discord:\n";
    message += this.createTable(rows);
    return message;
  }

  private static formatHTTPError(error: HTTPError): string {
    const rows: Array<{ key: string; value: string }> = [];
    rows.push({ key: "Status", value: String(error.status) });
    rows.push({ key: "Método", value: error.method });

    const errorAny = error as any;
    if (errorAny.path) {
      rows.push({ key: "Path", value: errorAny.path });
    }

    if (errorAny.requestData) {
      rows.push({
        key: "Request Data",
        value: JSON.stringify(errorAny.requestData).substring(0, 80),
      });
    }

    let message = "\n🌐 Erro HTTP:\n";
    message += this.createTable(rows);
    return message;
  }

  public static handleSilently(error: unknown, context?: string): void {
    const errorMessage = this.formatError(error, context);
    console.warn(errorMessage);
  }

  public static formatShort(error: unknown, context?: string): string {
    if (error instanceof Error) {
      const contextStr = context ? `[${context}] ` : "";
      return `❌ ${contextStr}${error.constructor.name}: ${error.message}`;
    }
    return `❌ ${context || "Erro desconhecido"}`;
  }

  public static isRecoverable(error: unknown): boolean {
    if (error instanceof DiscordAPIError) {
      if (error.status && error.status >= 500) {
        return true;
      }
      if (error.status === 429) {
        return true;
      }
    }
    return false;
  }

  public static getSuggestions(error: unknown): string[] {
    const suggestions: string[] = [];

    if (error instanceof DiscordAPIError) {
      if (error.status === 401) {
        suggestions.push(
          "Verifique se o token do bot está correto no arquivo .env"
        );
        suggestions.push(
          "Certifique-se de que o bot não foi removido do servidor"
        );
      } else if (error.status === 403) {
        suggestions.push("Verifique as permissões do bot no servidor");
        suggestions.push(
          "Certifique-se de que o bot tem as permissões necessárias"
        );
      } else if (error.status === 429) {
        suggestions.push("Aguarde alguns segundos antes de tentar novamente");
        suggestions.push("Considere implementar rate limiting");
      } else if (
        error.status === 500 ||
        error.status === 502 ||
        error.status === 503
      ) {
        suggestions.push(
          "Este é um erro do servidor do Discord, tente novamente mais tarde"
        );
        suggestions.push("Verifique o status do Discord em status.discord.com");
      }
    } else if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        suggestions.push("Confirme se a porta está correta no arquivo .env");
      } else if (error.message.includes("Cannot find module")) {
        suggestions.push("Execute: npm install");
        suggestions.push("Verifique se todos os arquivos necessários existem");
      }
    }

    return suggestions;
  }

  public static formatWithSuggestions(
    error: unknown,
    context?: string
  ): string {
    let message = this.formatError(error, context);

    const suggestions = this.getSuggestions(error);
    if (suggestions.length > 0) {
      const suggestionRows: Array<{ key: string; value: string }> = [];
      suggestions.forEach((suggestion, index) => {
        suggestionRows.push({
          key: `${index + 1}`,
          value: suggestion,
        });
      });
      message += "💡 Sugestões de correção:\n";
      message += this.createTable(suggestionRows);
    }

    if (this.isRecoverable(error)) {
      message += "🔄 Este erro é recuperável - você pode tentar novamente\n\n";
    }

    return message;
  }

  public static handleWithSuggestions(error: unknown, context?: string): void {
    const message = this.formatWithSuggestions(error, context);
    console.error(message);
  }

  public static getUserFriendlyMessage(
    error: unknown,
    defaultMessage: string = "❌ Ocorreu um erro inesperado"
  ): string {
    if (error instanceof Error) {
      if (error instanceof DiscordAPIError) {
        if (error.status === 403) {
          return "❌ Não tenho permissão para executar esta ação";
        }
        if (error.status === 404) {
          return "❌ Recurso não encontrado";
        }
        if (error.status === 429) {
          return "⏳ Estou sendo limitado pela API. Aguarde um momento";
        }
        if (error.status && error.status >= 500) {
          return "❌ Erro no servidor do Discord. Tente novamente mais tarde";
        }
      }

      if (error.message.includes("Missing Permissions")) {
        return "❌ Não tenho permissão para executar esta ação";
      }
      if (error.message.includes("Invalid Form Body")) {
        return "❌ Dados inválidos fornecidos";
      }
    }

    return defaultMessage;
  }

  public static async wrapAsync<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error, context || "wrapAsync");
      return null;
    }
  }

  public static wrapSync<T>(fn: () => T, context?: string): T | null {
    try {
      return fn();
    } catch (error) {
      this.handle(error, context || "wrapSync");
      return null;
    }
  }

  public static isInitialized(): boolean {
    return this.initialized;
  }
}
