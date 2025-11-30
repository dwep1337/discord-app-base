# Banco de Dados - Estrutura Base

Esta pasta contém a estrutura base preparada para adicionar qualquer ORM/ODM de banco de dados.

## 📋 Interfaces Disponíveis

### `IDatabaseClient`

Interface base para qualquer cliente de banco de dados:

```typescript
export interface IDatabaseClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}
```

### `IRepository<T>`

Interface genérica para repositórios:

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

## 🚀 Como Adicionar um ORM/ODM

### Exemplo: Mongoose (MongoDB)

1. **Instalar dependências:**

```bash
npm install mongoose
```

2. **Criar o Adapter:**

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
      console.warn("⚠️ DATABASE_URL não configurado");
      return;
    }
    await mongoose.connect(this.config.databaseUrl);
    this.connected = true;
    console.log("✅ Conectado ao MongoDB");
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

3. **Criar Schemas:**

```typescript
// src/infrastructure/database/models/Guild.ts
import mongoose, { Schema } from "mongoose";

const guildSchema = new Schema(
  {
    discordId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    settings: {
      prefix: { type: String, default: "!" },
      language: { type: String, default: "pt-BR" },
    },
  },
  { timestamps: true }
);

export const GuildModel = mongoose.model("Guild", guildSchema);
```

4. **Criar Repositório:**

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

  // ... implementar outros métodos
}
```

5. **Integrar no Bot.ts:**

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

### Exemplo: Prisma (SQL/NoSQL)

Siga o mesmo padrão, criando:

- `PrismaClientAdapter` implementando `IDatabaseClient`
- Repositórios implementando `IRepository<T>`
- Schemas no `prisma/schema.prisma`

## 📝 Notas

- Mantenha as interfaces em `core/types/` puras (sem dependências de frameworks)
- Implemente os adapters em `infrastructure/database/`
- Use casos de uso em `application/use-cases/database/` para lógica de negócio
- A configuração `DATABASE_URL` já está disponível em `Config`
