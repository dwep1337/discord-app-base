import { readdirSync, statSync, existsSync } from "fs";
import { join, resolve } from "path";
import { ILoader } from "../../core/types";

export class Loader implements ILoader {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  public async loadFromDirectory<T>(
    directory: string,
    filter: (file: string) => boolean
  ): Promise<T[]> {
    const fullPath = resolve(this.basePath, directory);
    const modules: T[] = [];

    if (!existsSync(fullPath)) {
      console.error(`❌ Diretório não existe: ${fullPath}`);
      return modules;
    }

    try {
      await this.loadRecursive<T>(fullPath, filter, modules);
    } catch (error: any) {
      console.error(
        `❌ Erro ao carregar diretório ${fullPath}:`,
        error.message || error
      );
    }

    return modules;
  }

  /**
   * Carrega módulos de um diretório e retorna com informações de categoria
   */
  public async loadFromDirectoryWithCategory<T>(
    directory: string,
    filter: (file: string) => boolean
  ): Promise<Array<{ module: T; category?: string }>> {
    const fullPath = resolve(this.basePath, directory);
    const modules: Array<{ module: T; category?: string }> = [];

    if (!existsSync(fullPath)) {
      console.error(`❌ Diretório não existe: ${fullPath}`);
      return modules;
    }

    try {
      await this.loadRecursiveWithCategory<T>(
        fullPath,
        filter,
        modules,
        fullPath
      );
    } catch (error: any) {
      console.error(
        `❌ Erro ao carregar diretório ${fullPath}:`,
        error.message || error
      );
    }

    return modules;
  }

  private async loadRecursive<T>(
    dirPath: string,
    filter: (file: string) => boolean,
    modules: T[]
  ): Promise<void> {
    try {
      const items = readdirSync(dirPath);

      for (const item of items) {
        const itemPath = join(dirPath, item);
        const stat = statSync(itemPath);

        if (stat.isDirectory()) {
          await this.loadRecursive<T>(itemPath, filter, modules);
        } else if (stat.isFile() && filter(item)) {
          try {
            // CommonJS: remove extensão .js para require() funcionar corretamente
            const modulePath = itemPath.replace(/\.js$/, "");
            const module = require(modulePath).default;
            if (module) {
              modules.push(module);
            } else {
              console.warn(`⚠️ Módulo ${itemPath} não tem export default`);
            }
          } catch (error: any) {
            console.error(
              `❌ Erro ao carregar ${itemPath}:`,
              error.message || error
            );
          }
        }
      }
    } catch (error: any) {
      console.error(
        `❌ Erro ao ler diretório ${dirPath}:`,
        error.message || error
      );
    }
  }

  private async loadRecursiveWithCategory<T>(
    dirPath: string,
    filter: (file: string) => boolean,
    modules: Array<{ module: T; category?: string }>,
    basePath: string
  ): Promise<void> {
    try {
      const items = readdirSync(dirPath);

      for (const item of items) {
        const itemPath = join(dirPath, item);
        const stat = statSync(itemPath);

        if (stat.isDirectory()) {
          await this.loadRecursiveWithCategory<T>(
            itemPath,
            filter,
            modules,
            basePath
          );
        } else if (stat.isFile() && filter(item)) {
          try {
            // CommonJS: remove extensão .js para require() funcionar corretamente
            const modulePath = itemPath.replace(/\.js$/, "");
            const module = require(modulePath).default;
            if (module) {
              // Extrai categoria do caminho: subpasta = categoria, raiz = sem categoria
              const relativePath = itemPath
                .replace(basePath + "/", "")
                .replace(/\.js$/, "");
              const pathParts = relativePath.split("/");
              const category = pathParts.length > 1 ? pathParts[0] : undefined;

              modules.push({ module, category });
            } else {
              console.warn(`⚠️ Módulo ${itemPath} não tem export default`);
            }
          } catch (error: any) {
            console.error(
              `❌ Erro ao carregar ${itemPath}:`,
              error.message || error
            );
          }
        }
      }
    } catch (error: any) {
      console.error(
        `❌ Erro ao ler diretório ${dirPath}:`,
        error.message || error
      );
    }
  }
}
