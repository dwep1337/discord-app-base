export interface IResourceStats {
  cpu: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    rx: number;
    tx: number;
  };
  uptime: number;
}
