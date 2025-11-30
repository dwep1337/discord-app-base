import { DiscordErrorCodes } from "./DiscordErrorCodes";

/**
 * Mensagens de erro amigáveis para códigos HTTP do Discord
 */
export const ERROR_MESSAGES: Record<DiscordErrorCodes, string> = {
  [DiscordErrorCodes.BAD_REQUEST]:
    "Requisição inválida - Verifique os parâmetros enviados",
  [DiscordErrorCodes.UNAUTHORIZED]: "Não autorizado - Verifique o token do bot",
  [DiscordErrorCodes.FORBIDDEN]:
    "Sem permissão - O bot não tem permissão para esta ação",
  [DiscordErrorCodes.NOT_FOUND]:
    "Não encontrado - O recurso solicitado não existe",
  [DiscordErrorCodes.TOO_MANY_REQUESTS]:
    "Rate limit excedido - Muitas requisições, aguarde um momento",
  [DiscordErrorCodes.INTERNAL_SERVER_ERROR]:
    "Erro interno do Discord - Tente novamente mais tarde",
  [DiscordErrorCodes.BAD_GATEWAY]:
    "Bad Gateway - Servidor do Discord temporariamente indisponível",
  [DiscordErrorCodes.SERVICE_UNAVAILABLE]:
    "Serviço indisponível - Discord está em manutenção",
};
