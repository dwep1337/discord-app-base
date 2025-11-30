# Database Repositories

This directory is where you should create your repositories that implement the `IRepository<T>` interface.

## How to create a repository

Implement the `IRepository<T>` interface directly:

```typescript
import { IRepository } from "../../../core/types/IRepository";

export class MyRepository implements IRepository<MyModel> {
  constructor(private client: any) {} // Your database client (Mongoose, Prisma, etc)

  async findById(id: string): Promise<MyModel | null> {
    // Implementation using your ORM/ODM
  }

  async findAll(): Promise<MyModel[]> {
    // Implementation
  }

  async create(data: Partial<MyModel>): Promise<MyModel> {
    // Implementation
  }

  async update(id: string, data: Partial<MyModel>): Promise<MyModel> {
    // Implementation
  }

  async delete(id: string): Promise<boolean> {
    // Implementation
  }

  async exists(id: string): Promise<boolean> {
    // Implementation
  }
}
```

## Example usage in use case

```typescript
import { MyRepository } from "../../../infrastructure/database/repositories/MyRepository";

export class MyUseCase {
  private repository: MyRepository;

  constructor(databaseClient: any) {
    this.repository = new MyRepository(databaseClient);
  }

  async execute() {
    return this.repository.findAll();
  }
}
```
