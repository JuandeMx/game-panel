import { EventEmitter } from 'events';
import { ServerStatus, ServerMetrics, LogMessage, WorldInfo, BackupInfo, PlayerInfo, GameType } from '../src/types';

export interface IGameAdapter extends EventEmitter {
  readonly id: string;
  readonly name: string;
  readonly gameType: GameType;
  readonly gameTitle: string;
  readonly version: string;
  readonly port: number;
  readonly host: string;

  getStatus(): ServerStatus;
  getMetrics(): ServerMetrics;
  getLogs(limit?: number): LogMessage[];
  getWorlds(): WorldInfo[];
  getActiveWorld(): WorldInfo | null;
  getBackups(): BackupInfo[];
  getPlayers(): PlayerInfo[];
  getConfig(): Record<string, any>;
  getRawConfigFile(): string;

  start(): Promise<{ success: boolean; message: string }>;
  stop(graceful?: boolean): Promise<{ success: boolean; message: string }>;
  restart(): Promise<{ success: boolean; message: string }>;
  forceKill(): Promise<{ success: boolean; message: string }>;
  
  sendCommand(command: string): Promise<{ success: boolean; message: string }>;
  saveConfig(config: Record<string, any>): Promise<{ success: boolean; message: string }>;
  saveRawConfigFile(content: string): Promise<{ success: boolean; message: string }>;
  
  createWorld(options: { name: string; size: 'Small' | 'Medium' | 'Large'; difficulty: 'Classic' | 'Expert' | 'Master' | 'Journey'; seed?: string }): Promise<{ success: boolean; world?: WorldInfo; message: string }>;
  selectWorld(filename: string): Promise<{ success: boolean; message: string }>;
  createBackup(worldName?: string, trigger?: 'manual' | 'auto_shutdown' | 'scheduled'): Promise<{ success: boolean; backup?: BackupInfo; message: string }>;
  restoreBackup(backupId: string): Promise<{ success: boolean; message: string }>;
  deleteBackup(backupId: string): Promise<{ success: boolean; message: string }>;

  kickPlayer(playerName: string, reason?: string): Promise<{ success: boolean; message: string }>;
  banPlayer(playerName: string, reason?: string): Promise<{ success: boolean; message: string }>;

  setAutoBackupOnStop(enabled: boolean): void;
  isAutoBackupOnStopEnabled(): boolean;
}
