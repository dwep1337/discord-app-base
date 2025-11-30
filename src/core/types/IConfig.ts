export interface IConfig {
  token: string;
  clientId: string;
  intents: number[];
  partials: number[];
  registerGuildCommands: boolean;
  testGuildId?: string;
}
