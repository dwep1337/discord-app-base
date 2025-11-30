import { Collection } from "discord.js";
import { Command } from "../../core/entities/Command";
import { IManager } from "../../core/types";
import { LoadCommandsUseCase } from "../use-cases/commands/LoadCommandsUseCase";

export class CommandManager implements IManager<Command> {
  private commands: Collection<string, Command> = new Collection();
  private loadCommandsUseCase: LoadCommandsUseCase;

  constructor(basePath: string) {
    this.loadCommandsUseCase = new LoadCommandsUseCase(basePath);
  }

  public async load(): Promise<void> {
    this.commands = await this.loadCommandsUseCase.execute();
  }

  public get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  public getAll(): Collection<string, Command> {
    return this.commands;
  }

  public has(name: string): boolean {
    return this.commands.has(name);
  }

  public set(name: string, command: Command): void {
    this.commands.set(name, command);
  }

  public delete(name: string): boolean {
    return this.commands.delete(name);
  }

  public size(): number {
    return this.commands.size;
  }
}
