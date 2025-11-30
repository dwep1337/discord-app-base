# Discord Bot - TypeScript

Discord bot built with TypeScript, Clean Architecture, and Discord.js.

## 🚀 Quick Start

```bash
npm install
npm run build
npm start
```

## ⚙️ Configuration

Create a `.env` file:

```env
DISCORD_TOKEN=your_token_here
CLIENT_ID=your_client_id_here
REGISTER_GUILD_COMMANDS=false
TEST_GUILD_ID=optional
DATABASE_URL=optional (for when adding a database)
```

## 📁 Structure

```
src/
├── core/          # Pure business logic
├── domain/         # Entities with dependencies
├── application/    # Use cases and services
├── infrastructure/ # External adapters
├── presentation/   # Commands and events
└── shared/        # Shared utilities
```

## 📝 Scripts

- `npm run build` - Compile the project
- `npm start` - Run the bot
- `npm run dev` - Development mode (hot-reload)
- `npm run register` - Manually register commands
- `npm run delete-commands` - Remove all commands

## 🎯 Creating a Command

Create a new file in `src/presentation/commands/`:

```typescript
import { Command } from "../../../core/entities/Command";
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export default class MyCommand extends Command {
  public data = new SlashCommandBuilder()
    .setName("mycommand")
    .setDescription("Description");

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.reply("Response!");
  }
}
```

## 🎪 Creating an Event

Create a new file in `src/presentation/events/`:

```typescript
import { Event } from "../../core/entities/Event";
import { Client } from "discord.js";

export default class MessageCreateEvent extends Event {
  constructor() {
    super("messageCreate", false); // Event name and once flag
  }

  public async execute(client: Client, ...args: any[]): Promise<void> {
    // Your event logic here
    const message = args[0];
    console.log(`Message received: ${message.content}`);
  }
}
```

**Available Discord events:**

- `ready` - Bot is ready
- `messageCreate` - New message
- `interactionCreate` - Slash command interaction
- `guildMemberAdd` - Member joined
- `guildMemberRemove` - Member left
- And more... (see [Discord.js Events](https://discord.js.org/#/docs/discord.js/stable/class/Client))

**Event constructor parameters:**

- First parameter: Event name (must match Discord.js event name)
- Second parameter: `once` flag (true = runs once, false = runs every time)

## 📚 Technologies

- TypeScript
- Discord.js 14.25.1
- Clean Architecture
- Node.js 18+

## 🗄️ Database

The project is prepared to add any ORM/ODM (Prisma, Mongoose, TypeORM, etc).

See `src/infrastructure/database/README.md` for instructions on how to add a database.

## 📄 License

MIT
