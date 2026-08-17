export type ServerStatus = 'offline' | 'starting' | 'online' | 'stopping' | 'restarting' | 'crashed';

export type GameType = 'terraria_vanilla' | 'terraria_tshock' | 'minecraft' | 'rust';

export interface ServerMetrics {
  cpu: number; // 0 - 100%
  memoryMb: number;
  maxMemoryMb: number;
  uptimeSeconds: number;
  playersOnline: number;
  maxPlayers: number;
  tps: number;
  pingMs: number;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'cmd' | 'chat' | 'system';

export interface LogMessage {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source?: string;
}

export interface TerrariaConfig {
  world: string;
  port: number;
  maxplayers: number;
  password?: string;
  motd?: string;
  worldname: string;
  autocreate: number; // 1 = small, 2 = medium, 3 = large
  difficulty: number; // 0 = classic, 1 = expert, 2 = master, 3 = journey
  worldpath?: string;
  banlist?: string;
  secure?: number;
  language?: string;
  seed?: string;
  priority?: number;
  npcstream?: number;
  upnp?: number;
}

export interface WorldInfo {
  filename: string;
  name: string;
  size: 'Small' | 'Medium' | 'Large';
  difficulty: 'Classic' | 'Expert' | 'Master' | 'Journey';
  seed?: string;
  createdDate: string;
  lastSavedDate: string;
  sizeMb: number;
  hardmode: boolean;
  bossesDefeated: string[];
  activeEvents: string[];
  inGameTime: string; // e.g. "12:00 PM (Día)"
  isDayTime: boolean;
  moonPhase?: string;
}

export interface BackupInfo {
  id: string;
  name: string;
  worldName: string;
  timestamp: string;
  sizeMb: number;
  trigger: 'manual' | 'auto_shutdown' | 'scheduled';
  fileCount?: number;
}

export interface PlayerInfo {
  id: string;
  name: string;
  ip: string;
  ping: number;
  joinedAt: string;
  characterClass?: 'Melee' | 'Ranger' | 'Mage' | 'Summoner' | 'Novice';
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  isHost?: boolean;
  isAdmin?: boolean;
  kills?: number;
  deaths?: number;
}

export interface GameServerInstance {
  id: string;
  name: string;
  gameType: GameType;
  gameTitle: string;
  version: string;
  status: ServerStatus;
  port: number;
  host: string;
  metrics: ServerMetrics;
  config: Record<string, any>;
  activeWorld: string;
  autoBackupOnStop: boolean;
  startupCommand: string;
}

export interface ServerEvent {
  id: string;
  timestamp: string;
  type: 'player_join' | 'player_leave' | 'boss_killed' | 'event_started' | 'event_ended' | 'backup_created' | 'server_state';
  title: string;
  description: string;
}
