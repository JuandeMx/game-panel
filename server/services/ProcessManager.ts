import { IGameAdapter } from '../types';
import { TerrariaAdapter } from '../adapters/TerrariaAdapter';
import { MinecraftAdapter } from '../adapters/MinecraftAdapter';
import { GameServerInstance, GameType } from '../../src/types';

export class ProcessManager {
  private static instance: ProcessManager;
  private adapters: Map<string, IGameAdapter> = new Map();

  private constructor() {
    this.initializeDefaultServers();
  }

  public static getInstance(): ProcessManager {
    if (!ProcessManager.instance) {
      ProcessManager.instance = new ProcessManager();
    }
    return ProcessManager.instance;
  }

  private initializeDefaultServers() {
    // 1. Primary: Terraria TShock 5.2 Server
    const terrariaTShock = new TerrariaAdapter('terraria-tshock-01', 'Terraria Master Realm (TShock 5.2)', 'terraria_tshock', 7777);
    this.adapters.set(terrariaTShock.id, terrariaTShock);

    // 2. Terraria Vanilla Server
    const terrariaVanilla = new TerrariaAdapter('terraria-vanilla-02', 'Terraria Classic World (Vanilla 1.4.4.9)', 'terraria_vanilla', 7778);
    this.adapters.set(terrariaVanilla.id, terrariaVanilla);

    // 3. Modular Minecraft Server
    const minecraftSMP = new MinecraftAdapter('minecraft-paper-01', 'Minecraft Survival SMP (PaperMC 1.20.4)', 25565);
    this.adapters.set(minecraftSMP.id, minecraftSMP);
  }

  public getAllServers(): GameServerInstance[] {
    return Array.from(this.adapters.values()).map(adapter => ({
      id: adapter.id,
      name: adapter.name,
      gameType: adapter.gameType,
      gameTitle: adapter.gameTitle,
      version: adapter.version,
      status: adapter.getStatus(),
      port: adapter.port,
      host: adapter.host,
      metrics: adapter.getMetrics(),
      config: adapter.getConfig(),
      activeWorld: adapter.getActiveWorld()?.name || 'Default World',
      autoBackupOnStop: adapter.isAutoBackupOnStopEnabled(),
      startupCommand: adapter.gameType.startsWith('terraria') ? `./TerrariaServer.bin.x86_64 -config serverconfig.txt -port ${adapter.port}` : `java -Xms2G -Xmx4G -jar paper.jar --nogui`,
    }));
  }

  public getAdapter(id: string): IGameAdapter | undefined {
    return this.adapters.get(id);
  }

  public createServer(options: { name: string; gameType: GameType; port: number }): IGameAdapter {
    const id = `${options.gameType}-${Date.now()}`;
    let adapter: IGameAdapter;

    if (options.gameType === 'minecraft') {
      adapter = new MinecraftAdapter(id, options.name, options.port);
    } else {
      adapter = new TerrariaAdapter(id, options.name, options.gameType, options.port);
    }

    this.adapters.set(id, adapter);
    return adapter;
  }
}
