import { EventEmitter } from 'events';
import { IGameAdapter } from '../types';
import { ServerStatus, ServerMetrics, LogMessage, WorldInfo, BackupInfo, PlayerInfo, GameType } from '../../src/types';

export abstract class BaseGameAdapter extends EventEmitter implements IGameAdapter {
  public readonly id: string;
  public readonly name: string;
  public readonly gameType: GameType;
  public readonly gameTitle: string;
  public readonly version: string;
  public readonly port: number;
  public readonly host: string;

  protected status: ServerStatus = 'offline';
  protected logs: LogMessage[] = [];
  protected maxLogBuffer: number = 2000;
  protected autoBackupOnStop: boolean = true;
  protected activeWorldFilename: string = 'TerrariaWorld.wld';

  protected metrics: ServerMetrics = {
    cpu: 0,
    memoryMb: 0,
    maxMemoryMb: 2048,
    uptimeSeconds: 0,
    playersOnline: 0,
    maxPlayers: 16,
    tps: 60,
    pingMs: 15,
  };

  constructor(
    id: string,
    name: string,
    gameType: GameType,
    gameTitle: string,
    version: string,
    port: number,
    host: string = '127.0.0.1'
  ) {
    super();
    this.id = id;
    this.name = name;
    this.gameType = gameType;
    this.gameTitle = gameTitle;
    this.version = version;
    this.port = port;
    this.host = host;
  }

  public getStatus(): ServerStatus {
    return this.status;
  }

  public getMetrics(): ServerMetrics {
    return { ...this.metrics };
  }

  public getLogs(limit: number = 200): LogMessage[] {
    return this.logs.slice(-limit);
  }

  public isAutoBackupOnStopEnabled(): boolean {
    return this.autoBackupOnStop;
  }

  public setAutoBackupOnStop(enabled: boolean): void {
    this.autoBackupOnStop = enabled;
  }

  protected addLog(level: LogMessage['level'], message: string, source?: string): LogMessage {
    const log: LogMessage = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      level,
      message,
      source: source || this.gameTitle,
    };

    this.logs.push(log);
    if (this.logs.length > this.maxLogBuffer) {
      this.logs.shift();
    }

    this.emit('log', log);
    return log;
  }

  protected setStatus(newStatus: ServerStatus): void {
    const oldStatus = this.status;
    this.status = newStatus;
    this.emit('statusChange', { serverId: this.id, status: newStatus, oldStatus });
  }

  // Abstract methods to be implemented by specific game adapters
  abstract start(): Promise<{ success: boolean; message: string }>;
  abstract stop(graceful?: boolean): Promise<{ success: boolean; message: string }>;
  abstract restart(): Promise<{ success: boolean; message: string }>;
  abstract forceKill(): Promise<{ success: boolean; message: string }>;
  abstract sendCommand(command: string): Promise<{ success: boolean; message: string }>;
  abstract getConfig(): Record<string, any>;
  abstract getRawConfigFile(): string;
  abstract saveConfig(config: Record<string, any>): Promise<{ success: boolean; message: string }>;
  abstract saveRawConfigFile(content: string): Promise<{ success: boolean; message: string }>;
  abstract getWorlds(): WorldInfo[];
  abstract getActiveWorld(): WorldInfo | null;
  abstract selectWorld(filename: string): Promise<{ success: boolean; message: string }>;
  abstract createWorld(options: { name: string; size: 'Small' | 'Medium' | 'Large'; difficulty: 'Classic' | 'Expert' | 'Master' | 'Journey'; seed?: string }): Promise<{ success: boolean; world?: WorldInfo; message: string }>;
  abstract getBackups(): BackupInfo[];
  abstract createBackup(worldName?: string, trigger?: 'manual' | 'auto_shutdown' | 'scheduled'): Promise<{ success: boolean; backup?: BackupInfo; message: string }>;
  abstract restoreBackup(backupId: string): Promise<{ success: boolean; message: string }>;
  abstract deleteBackup(backupId: string): Promise<{ success: boolean; message: string }>;
  abstract getPlayers(): PlayerInfo[];
  abstract kickPlayer(playerName: string, reason?: string): Promise<{ success: boolean; message: string }>;
  abstract banPlayer(playerName: string, reason?: string): Promise<{ success: boolean; message: string }>;
}
