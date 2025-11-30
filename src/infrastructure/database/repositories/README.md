# Repositórios de Banco de Dados

Este diretório é onde você deve criar seus repositórios que implementam a interface `IRepository<T>`.

## Como criar um repositório

Implemente a interface `IRepository<T>` diretamente:

```typescript
import { IRepository } from "../../../core/types/IRepository";

export class MeuRepository implements IRepository<MeuModel> {
  constructor(private client: any) {} // Seu cliente de banco (Mongoose, Prisma, etc)

  async findById(id: string): Promise<MeuModel | null> {
    // Implementação usando seu ORM/ODM
  }

  async findAll(): Promise<MeuModel[]> {
    // Implementação
  }

  async create(data: Partial<MeuModel>): Promise<MeuModel> {
    // Implementação
  }

  async update(id: string, data: Partial<MeuModel>): Promise<MeuModel> {
    // Implementação
  }

  async delete(id: string): Promise<boolean> {
    // Implementação
  }

  async exists(id: string): Promise<boolean> {
    // Implementação
  }
}
```

## Exemplo de uso em caso de uso

```typescript
import { MeuRepository } from "../../../infrastructure/database/repositories/MeuRepository";

export class MeuUseCase {
  private repository: MeuRepository;

  constructor(databaseClient: any) {
    this.repository = new MeuRepository(databaseClient);
  }

  async execute() {
    return this.repository.findAll();
  }
}
```
