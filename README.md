# Bot Discord - TypeScript

Bot Discord desenvolvido com TypeScript, Clean Architecture e Discord.js.

## 🚀 Início Rápido

```bash
npm install
npm run build
npm start
```

## ⚙️ Configuração

Crie um arquivo `.env`:

```env
DISCORD_TOKEN=seu_token_aqui
CLIENT_ID=seu_client_id_aqui
REGISTER_GUILD_COMMANDS=false
TEST_GUILD_ID=opcional
DATABASE_URL=opcional (para quando adicionar um banco de dados)
```

## 📁 Estrutura

```
src/
├── core/          # Regras de negócio puras
├── domain/         # Entidades com dependências
├── application/    # Casos de uso e serviços
├── infrastructure/ # Adaptadores externos
├── presentation/   # Comandos e eventos
└── shared/        # Utilitários compartilhados
```

## 📝 Scripts

- `npm run build` - Compila o projeto
- `npm start` - Executa o bot
- `npm run dev` - Modo desenvolvimento (hot-reload)
- `npm run register` - Registra comandos manualmente
- `npm run delete-commands` - Remove todos os comandos

## 🎯 Criar Comando

```typescript
import { Command } from "../../../core/entities/Command";
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export default class MeuComando extends Command {
  public data = new SlashCommandBuilder()
    .setName("meucomando")
    .setDescription("Descrição");

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.reply("Resposta!");
  }
}
```

## 📚 Tecnologias

- TypeScript
- Discord.js 14.25.1
- Clean Architecture
- Node.js 18+

## 🗄️ Banco de Dados

O projeto está preparado para adicionar qualquer ORM/ODM (Prisma, Mongoose, TypeORM, etc).

Veja `src/infrastructure/database/README.md` para instruções de como adicionar um banco de dados.

## 📄 Licença

MIT
