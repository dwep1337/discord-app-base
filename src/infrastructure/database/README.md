# Database - Base Structure

This folder contains the base structure prepared to add any ORM/ODM database.

## 📋 Available Interfaces

### `IDatabaseClient`

Base interface for any database client:

```typescript
export interface IDatabaseClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}
```

### `IRepository<T>`

Generic interface for repositories:

```typescript
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
```

## 🚀 How to Add an ORM/ODM

### Example: Mongoose (MongoDB)

1. **Install dependencies:**

```bash
npm install mongoose
```

2. **Create the Adapter:**

```typescript
// src/infrastructure/database/MongooseClientAdapter.ts
import mongoose from "mongoose";
import { IDatabaseClient } from "../../core/types/IDatabaseClient";
import { Config } from "../config/Config";

export class MongooseClientAdapter implements IDatabaseClient {
  private config: Config;
  private connected: boolean = false;

  constructor() {
    this.config = Config.getInstance();
  }

  public async connect(): Promise<void> {
    if (!this.config.databaseUrl) {
      console.warn("⚠️ DATABASE_URL not configured");
      return;
    }
    await mongoose.connect(this.config.databaseUrl);
    this.connected = true;
    console.log("✅ Connected to MongoDB");
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected && mongoose.connection.readyState === 1;
  }

  public getConnection() {
    return mongoose.connection;
  }
}
```

3. **Create Schemas:**

```typescript
// src/infrastructure/database/models/Guild.ts
import mongoose, { Schema } from "mongoose";

const guildSchema = new Schema(
  {
    discordId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    settings: {
      prefix: { type: String, default: "!" },
      language: { type: String, default: "en-US" },
    },
  },
  { timestamps: true }
);

export const GuildModel = mongoose.model("Guild", guildSchema);
```

4. **Create Repository:**

```typescript
// src/infrastructure/database/repositories/GuildRepository.ts
import { IRepository } from "../../../core/types/IRepository";
import { GuildModel } from "../models/Guild";

export class GuildRepository implements IRepository<any> {
  async findById(id: string): Promise<any | null> {
    return GuildModel.findById(id);
  }

  async findAll(): Promise<any[]> {
    return GuildModel.find();
  }

  async create(data: Partial<any>): Promise<any> {
    return GuildModel.create(data);
  }

  // ... implement other methods
}
```

5. **Integrate in Bot.ts:**

```typescript
import { MongooseClientAdapter } from "../../infrastructure/database/MongooseClientAdapter";

export class Bot extends Client {
  private databaseClient: MongooseClientAdapter;

  constructor() {
    // ...
    this.databaseClient = new MongooseClientAdapter();
  }

  public async start(): Promise<void> {
    await this.databaseClient.connect();
    // ...
  }

  public getDatabaseClient(): MongooseClientAdapter {
    return this.databaseClient;
  }
}
```

### Example: Prisma (SQL/NoSQL)

Follow the same pattern, creating:

- `PrismaClientAdapter` implementing `IDatabaseClient`
- Repositories implementing `IRepository<T>`
- Schemas in `prisma/schema.prisma`

## 📝 Notes

- Keep interfaces in `core/types/` pure (no framework dependencies)
- Implement adapters in `infrastructure/database/`
- Use use cases in `application/use-cases/database/` for business logic
- The `DATABASE_URL` configuration is already available in `Config`
