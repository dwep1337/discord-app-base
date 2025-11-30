import pidusage from "pidusage";
import si from "systeminformation";
import { EventEmitter } from "events";
import { IResourceStats } from "../../core/types/IResourceStats";

export class ResourceMonitor extends EventEmitter {
  private intervalId?: NodeJS.Timeout;
  private updateInterval: number;
  private isRunning: boolean = false;
  private stats: IResourceStats = {
    cpu: 0,
    memory: { used: 0, total: 0, percentage: 0 },
    network: { rx: 0, tx: 0 },
    uptime: 0,
  };

  constructor(updateInterval: number = 2000) {
    super();
    this.updateInterval = updateInterval;
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      console.warn("⚠️ ResourceMonitor já está em execução");
      return;
    }

    this.isRunning = true;

    // Primeira atualização após um pequeno delay
    setTimeout(() => {
      this.updateStats();
    }, 100);

    // Depois atualiza a cada intervalo
    this.intervalId = setInterval(() => {
      this.updateStats();
    }, this.updateInterval);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
  }

  public getStats(): IResourceStats {
    return { ...this.stats };
  }

  private async updateStats(): Promise<void> {
    try {
      const processStats = await pidusage(process.pid);
      const memInfo = await si.mem();
      const networkStats = await si.networkStats();
      const uptime = process.uptime();

      const totalRx = networkStats.reduce(
        (sum, iface) => sum + iface.rx_bytes,
        0
      );
      const totalTx = networkStats.reduce(
        (sum, iface) => sum + iface.tx_bytes,
        0
      );

      this.stats = {
        cpu: processStats.cpu,
        memory: {
          used: processStats.memory,
          total: memInfo.total,
          percentage: (processStats.memory / memInfo.total) * 100,
        },
        network: {
          rx: totalRx,
          tx: totalTx,
        },
        uptime,
      };

      this.emit("update", this.stats);
      this.displayStats();
    } catch (error) {
      console.error("Erro ao atualizar estatísticas:", error);
    }
  }

  private displayStats(): void {
    if (!this.isRunning) return;

    const { cpu, memory, network, uptime } = this.stats;

    const memUsedMB = (memory.used / 1024 / 1024).toFixed(1);
    const memTotalMB = (memory.total / 1024 / 1024).toFixed(0);
    const networkRxMB = (network.rx / 1024 / 1024).toFixed(1);
    const networkTxMB = (network.tx / 1024 / 1024).toFixed(1);
    const uptimeFormatted = this.formatUptime(uptime);

    const cpuColor = this.getColor(cpu, 100);
    const memColor = this.getColor(memory.percentage, 100);

    process.stdout.write("\r\x1b[K");
    process.stdout.write(
      `📊 CPU: ${cpuColor}${cpu.toFixed(1)}%\x1b[0m | ` +
        `💾 RAM: ${memColor}${memory.percentage.toFixed(
          1
        )}%\x1b[0m (${memUsedMB}MB/${memTotalMB}MB) | ` +
        `🌐 NET: ⬇${networkRxMB}MB ⬆${networkTxMB}MB | ` +
        `⏱️ ${uptimeFormatted}`
    );
  }

  private getColor(value: number, max: number): string {
    const percentage = (value / max) * 100;
    if (percentage > 80) return "\x1b[31m"; // Vermelho
    if (percentage > 60) return "\x1b[33m"; // Amarelo
    return "\x1b[32m"; // Verde
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }
}
