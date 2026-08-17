import { BaseGameAdapter } from './GameAdapter';
import { ServerStatus, ServerMetrics, LogMessage, WorldInfo, BackupInfo, PlayerInfo, GameType } from '../../src/types';

export class MinecraftAdapter extends BaseGameAdapter {
  private config: Record<string, any> = {
    'server-port': 25565,
    'max-players': 20,
    'difficulty': 'hard',
    'gamemode': 'survival',
    'motd': 'A Minecraft SMP Server Powered by Multi-Game Panel',
    'level-name': 'world_smp',
    'pvp': true,
    'online-mode': true,
    'view-distance': 10,
  };

  private worlds: WorldInfo[] = [
    {
      filename: 'world_smp',
      name: 'SMP World (Overworld + Nether + End)',
      size: 'Large',
      difficulty: 'Master',
      seed: 'DiamondSMP-8839210',
      createdDate: '2026-08-01 10:00:00',
      lastSavedDate: '2026-08-17 12:00:00',
      sizeMb: 850.5,
      hardmode: true,
      bossesDefeated: ['Ender Dragon', 'Wither', 'Elder Guardian'],
      activeEvents: [],
      inGameTime: '02:30 PM (Día)',
      isDayTime: true,
    }
  ];

  private backups: BackupInfo[] = [
    {
      id: 'mc-bak-001',
      name: 'Backup_World_PreDragonFight.tar.gz',
      worldName: 'SMP World (Overworld + Nether + End)',
      timestamp: '2026-08-10 20:00:00',
      sizeMb: 740.0,
      trigger: 'manual',
    }
  ];

  private players: PlayerInfo[] = [
    {
      id: 'mc-p1',
      name: 'SteveCrafter',
      ip: '192.168.1.55',
      ping: 28,
      joinedAt: '2026-08-17 13:00:00',
      characterClass: 'Melee',
      health: 20,
      maxHealth: 20,
      mana: 0,
      maxMana: 0,
      isAdmin: true,
      kills: 45,
      deaths: 2,
    }
  ];

  private ticker: NodeJS.Timeout | null = null;

  constructor(id: string = 'minecraft-paper-01', name: string = 'Minecraft Survival SMP (PaperMC 1.20.4)', port: number = 25565) {
    super(id, name, 'minecraft', 'Minecraft (PaperMC 1.20.4)', '1.20.4', port);
    this.metrics.maxPlayers = this.config['max-players'];
    this.addLog('info', `[System] Adaptador Minecraft PaperMC inicializado en puerto ${this.port}.`);
  }

  public getConfig() {
    return { ...this.config };
  }

  public getRawConfigFile(): string {
    return Object.entries(this.config)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
  }

  public async saveConfig(newConfig: Record<string, any>) {
    this.config = { ...this.config, ...newConfig };
    this.metrics.maxPlayers = this.config['max-players'] || 20;
    this.addLog('system', `[Config] server.properties actualizado.`);
    return { success: true, message: 'Configuración guardada en server.properties' };
  }

  public async saveRawConfigFile(content: string) {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [k, v] = trimmed.split('=');
      if (k && v !== undefined) {
        this.config[k.trim()] = v.trim();
      }
    }
    return { success: true, message: 'server.properties actualizado con éxito.' };
  }

  public getWorlds(): WorldInfo[] {
    return this.worlds;
  }

  public getActiveWorld(): WorldInfo | null {
    return this.worlds[0];
  }

  public async selectWorld(filename: string) {
    return { success: true, message: `Mundo ${filename} seleccionado.` };
  }

  public async createWorld(options: any) {
    const w: WorldInfo = {
      filename: options.name.replace(/\s+/g, '_'),
      name: options.name,
      size: options.size,
      difficulty: options.difficulty,
      seed: options.seed || '123456789',
      createdDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastSavedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sizeMb: 120.0,
      hardmode: false,
      bossesDefeated: [],
      activeEvents: [],
      inGameTime: '06:00 AM (Amanecer)',
      isDayTime: true,
    };
    this.worlds.push(w);
    return { success: true, world: w, message: 'Mundo Minecraft creado.' };
  }

  public getBackups(): BackupInfo[] {
    return this.backups;
  }

  public async createBackup(worldName?: string, trigger: 'manual' | 'auto_shutdown' | 'scheduled' = 'manual') {
    const b: BackupInfo = {
      id: `mc-bak-${Date.now()}`,
      name: `Backup_Minecraft_${Date.now()}.tar.gz`,
      worldName: worldName || 'world_smp',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sizeMb: 850.0,
      trigger,
    };
    this.backups.unshift(b);
    return { success: true, backup: b, message: 'Backup Minecraft completado.' };
  }

  public async restoreBackup(backupId: string) {
    return { success: true, message: 'Backup de Minecraft restaurado.' };
  }

  public async deleteBackup(backupId: string) {
    const idx = this.backups.findIndex(b => b.id === backupId);
    if (idx !== -1) this.backups.splice(idx, 1);
    return { success: true, message: 'Backup eliminado.' };
  }

  public getPlayers(): PlayerInfo[] {
    return this.status === 'online' ? this.players : [];
  }

  public async kickPlayer(playerName: string, reason: string = 'Kicked by admin') {
    const idx = this.players.findIndex(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (idx !== -1) {
      this.players.splice(idx, 1);
      this.addLog('warn', `[Minecraft] Jugador ${playerName} expulsado: ${reason}`);
      return { success: true, message: `Jugador ${playerName} expulsado.` };
    }
    return { success: false, message: 'Jugador no encontrado.' };
  }

  public async banPlayer(playerName: string, reason: string = 'Banned by admin') {
    return this.kickPlayer(playerName, reason);
  }

  public async start() {
    this.setStatus('starting');
    this.addLog('info', `[Paper] Starting minecraft server version 1.20.4...`);
    this.addLog('info', `[Paper] Loading recipes, advancements, and world '${this.config['level-name']}'...`);
    this.addLog('info', `[Paper] Preparing start region for dimension minecraft:overworld`);

    setTimeout(() => {
      this.setStatus('online');
      this.addLog('system', `[Paper] Done (3.842s)! For help, type "help"`);
      this.metrics.memoryMb = 1420;
      this.metrics.playersOnline = this.players.length;

      if (this.ticker) clearInterval(this.ticker);
      this.ticker = setInterval(() => {
        if (this.status === 'online') {
          this.metrics.uptimeSeconds += 1;
          this.metrics.cpu = parseFloat((6 + Math.random() * 5).toFixed(1));
          this.metrics.tps = 20.0;
          this.emit('metrics', this.getMetrics());
        }
      }, 1000);
    }, 1500);

    return { success: true, message: 'Servidor Minecraft iniciando.' };
  }

  public async stop(graceful: boolean = true) {
    this.setStatus('stopping');
    this.addLog('info', `[Paper] Stopping server...`);
    this.addLog('info', `[Paper] Saving players & chunks for world 'world_smp'`);

    if (this.autoBackupOnStop && graceful) {
      await this.createBackup('world_smp', 'auto_shutdown');
    }

    setTimeout(() => {
      this.setStatus('offline');
      this.addLog('system', `[Paper] Server stopped cleanly.`);
      if (this.ticker) clearInterval(this.ticker);
      this.metrics.cpu = 0;
      this.metrics.memoryMb = 0;
      this.metrics.uptimeSeconds = 0;
      this.metrics.playersOnline = 0;
    }, 800);

    return { success: true, message: 'Servidor Minecraft deteniéndose.' };
  }

  public async restart() {
    await this.stop(true);
    setTimeout(() => this.start(), 1500);
    return { success: true, message: 'Reiniciando Minecraft...' };
  }

  public async forceKill() {
    this.setStatus('offline');
    if (this.ticker) clearInterval(this.ticker);
    this.addLog('error', `[System] Minecraft process SIGKILL triggered.`);
    return { success: true, message: 'Proceso detenido.' };
  }

  public async sendCommand(command: string) {
    this.addLog('cmd', `> ${command}`);
    if (command === 'help') {
      this.addLog('info', `[Paper] Available commands: /say, /save-all, /stop, /kick, /ban, /time set, /gamemode, /weather, /op`);
    } else if (command.startsWith('say')) {
      this.addLog('chat', `[Server] ${command.replace('say ', '')}`);
    } else if (command === 'save-all') {
      this.addLog('info', `[Paper] Saved the game (world_smp, world_nether, world_the_end)`);
    } else if (command === 'stop') {
      this.stop(true);
    } else {
      this.addLog('info', `[Paper] Command executed: ${command}`);
    }
    return { success: true, message: 'Comando procesado.' };
  }
}
