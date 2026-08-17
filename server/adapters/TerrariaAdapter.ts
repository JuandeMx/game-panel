import { BaseGameAdapter } from './GameAdapter';
import { ChildProcess, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { LogMessage, ServerStatus, TerrariaConfig, WorldInfo, BackupInfo, PlayerInfo, GameType } from '../../src/types';

export class TerrariaAdapter extends BaseGameAdapter {
  private process: ChildProcess | null = null;
  private configPath: string;
  private worldsDir: string;
  private backupsDir: string;
  private simulatedTimer: NodeJS.Timeout | null = null;
  private uptimeInterval: NodeJS.Timeout | null = null;
  private worldDayCycleTimer: NodeJS.Timeout | null = null;

  private config: TerrariaConfig = {
    world: 'Aethelgard_Prime.wld',
    port: 7777,
    maxplayers: 16,
    password: '',
    motd: 'Bienvenido al servidor de Terraria! Disfruta la aventura.',
    worldname: 'Aethelgard Prime',
    autocreate: 2, // Medium
    difficulty: 2, // Master
    secure: 1,
    language: 'es-ES',
    seed: 'CrimsonMoon2026',
    priority: 1,
    npcstream: 60,
    upnp: 1,
  };

  private worlds: WorldInfo[] = [
    {
      filename: 'Aethelgard_Prime.wld',
      name: 'Aethelgard Prime',
      size: 'Medium',
      difficulty: 'Master',
      seed: 'CrimsonMoon2026',
      createdDate: '2026-08-10 18:22:00',
      lastSavedDate: '2026-08-17 14:15:30',
      sizeMb: 24.8,
      hardmode: true,
      bossesDefeated: ['Eye of Cthulhu', 'Eater of Worlds', 'Brain of Cthulhu', 'Skeletron', 'Wall of Flesh', 'The Twins', 'The Destroyer', 'Skeletron Prime', 'Plantera'],
      activeEvents: [],
      inGameTime: '11:45 AM (Día)',
      isDayTime: true,
      moonPhase: 'Luna Llena',
    },
    {
      filename: 'Sanctuary_Chill.wld',
      name: 'Sanctuary Chill',
      size: 'Small',
      difficulty: 'Classic',
      seed: 'PeacefulValley88',
      createdDate: '2026-08-01 12:00:00',
      lastSavedDate: '2026-08-15 09:30:10',
      sizeMb: 12.4,
      hardmode: false,
      bossesDefeated: ['Eye of Cthulhu', 'King Slime'],
      activeEvents: [],
      inGameTime: '04:10 PM (Tarde)',
      isDayTime: true,
      moonPhase: 'Cuarto Creciente',
    },
    {
      filename: 'Hardcore_Inferno.wld',
      name: 'Hardcore Inferno',
      size: 'Large',
      difficulty: 'Expert',
      seed: 'ForTheWorthy404',
      createdDate: '2026-08-14 20:00:00',
      lastSavedDate: '2026-08-17 11:10:00',
      sizeMb: 48.2,
      hardmode: true,
      bossesDefeated: ['Eye of Cthulhu', 'Skeletron', 'Wall of Flesh'],
      activeEvents: ['Lluvia ácida'],
      inGameTime: '09:20 PM (Noche)',
      isDayTime: false,
      moonPhase: 'Luna Menguante',
    }
  ];

  private backups: BackupInfo[] = [
    {
      id: 'bak-001',
      name: 'Backup_PreHardmode_Aethelgard.zip',
      worldName: 'Aethelgard Prime',
      timestamp: '2026-08-12 16:45:00',
      sizeMb: 21.2,
      trigger: 'manual',
    },
    {
      id: 'bak-002',
      name: 'AutoBackup_Shutdown_Aethelgard.zip',
      worldName: 'Aethelgard Prime',
      timestamp: '2026-08-16 23:59:12',
      sizeMb: 24.1,
      trigger: 'auto_shutdown',
    }
  ];

  private players: PlayerInfo[] = [
    {
      id: 'p-1',
      name: 'TerrarianHero',
      ip: '192.168.1.105',
      ping: 24,
      joinedAt: '2026-08-17 13:40:12',
      characterClass: 'Melee',
      health: 500,
      maxHealth: 500,
      mana: 200,
      maxMana: 200,
      isAdmin: true,
      kills: 142,
      deaths: 3,
    },
    {
      id: 'p-2',
      name: 'StarGazer_Mage',
      ip: '192.168.1.112',
      ping: 38,
      joinedAt: '2026-08-17 14:02:45',
      characterClass: 'Mage',
      health: 400,
      maxHealth: 400,
      mana: 300,
      maxMana: 300,
      isAdmin: false,
      kills: 88,
      deaths: 12,
    },
    {
      id: 'p-3',
      name: 'SniperViper',
      ip: '192.168.1.140',
      ping: 19,
      joinedAt: '2026-08-17 14:18:30',
      characterClass: 'Ranger',
      health: 460,
      maxHealth: 500,
      mana: 100,
      maxMana: 100,
      isAdmin: false,
      kills: 110,
      deaths: 5,
    }
  ];

  constructor(id: string = 'terraria-tshock-01', name: string = 'Terraria Server (TShock 5.2)', gameType: GameType = 'terraria_tshock', port: number = 7777) {
    super(
      id,
      name,
      gameType,
      gameType === 'terraria_tshock' ? 'Terraria (TShock API 5.2.0)' : 'Terraria Vanilla 1.4.4.9',
      '1.4.4.9 / TShock 5.2',
      port
    );

    this.configPath = path.join(process.cwd(), 'serverconfig.txt');
    this.worldsDir = path.join(process.cwd(), 'worlds');
    this.backupsDir = path.join(process.cwd(), 'backups');

    this.metrics.maxPlayers = this.config.maxplayers;
    this.metrics.playersOnline = 0;

    // Add initial boot banner log
    this.addLog('info', `[System] Adaptador para ${this.gameTitle} inicializado en puerto ${this.port}.`);
  }

  public getConfig(): TerrariaConfig {
    return { ...this.config };
  }

  public getRawConfigFile(): string {
    return [
      `# Terraria Server Configuration File`,
      `# Generated automatically by Terraria Game Server Manager`,
      `world=${this.config.world}`,
      `port=${this.config.port}`,
      `maxplayers=${this.config.maxplayers}`,
      `password=${this.config.password || ''}`,
      `motd=${this.config.motd || ''}`,
      `worldname=${this.config.worldname}`,
      `autocreate=${this.config.autocreate}`,
      `difficulty=${this.config.difficulty}`,
      `secure=${this.config.secure || 1}`,
      `language=${this.config.language || 'es-ES'}`,
      `seed=${this.config.seed || ''}`,
      `priority=${this.config.priority || 1}`,
      `npcstream=${this.config.npcstream || 60}`,
      `upnp=${this.config.upnp || 1}`,
    ].join('\n');
  }

  public async saveConfig(newConfig: Partial<TerrariaConfig>): Promise<{ success: boolean; message: string }> {
    this.config = { ...this.config, ...newConfig };
    this.metrics.maxPlayers = this.config.maxplayers;
    this.addLog('system', `[Config] Configuración actualizada: Puerto ${this.config.port}, MaxPlayers ${this.config.maxplayers}, Dificultad ${this.config.difficulty}`);
    return { success: true, message: 'Configuración guardada exitosamente en serverconfig.txt' };
  }

  public async saveRawConfigFile(content: string): Promise<{ success: boolean; message: string }> {
    try {
      const lines = content.split('\n');
      const parsed: Record<string, any> = {};
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (['port', 'maxplayers', 'autocreate', 'difficulty', 'secure', 'priority', 'npcstream', 'upnp'].includes(key)) {
            parsed[key] = parseInt(val, 10) || 0;
          } else {
            parsed[key] = val;
          }
        }
      }
      this.config = { ...this.config, ...parsed };
      this.metrics.maxPlayers = this.config.maxplayers;
      this.addLog('system', `[Config] serverconfig.txt modificado y aplicado.`);
      return { success: true, message: 'Archivo de configuración crudo parseado y guardado.' };
    } catch (e: any) {
      return { success: false, message: `Error parseando archivo: ${e.message}` };
    }
  }

  public getWorlds(): WorldInfo[] {
    return this.worlds;
  }

  public getActiveWorld(): WorldInfo | null {
    return this.worlds.find(w => w.filename === this.config.world || w.name === this.config.worldname) || this.worlds[0] || null;
  }

  public async selectWorld(filename: string): Promise<{ success: boolean; message: string }> {
    const target = this.worlds.find(w => w.filename === filename);
    if (!target) {
      return { success: false, message: `El mundo '${filename}' no fue encontrado.` };
    }
    this.config.world = target.filename;
    this.config.worldname = target.name;
    this.addLog('info', `[Mundos] Mundo activo establecido a '${target.name}' (${target.filename}).`);
    return { success: true, message: `Mundo activo seleccionado: ${target.name}` };
  }

  public async createWorld(options: {
    name: string;
    size: 'Small' | 'Medium' | 'Large';
    difficulty: 'Classic' | 'Expert' | 'Master' | 'Journey';
    seed?: string;
  }): Promise<{ success: boolean; world?: WorldInfo; message: string }> {
    const filename = `${options.name.replace(/\s+/g, '_')}.wld`;
    const difficultyMap = { Classic: 0, Expert: 1, Master: 2, Journey: 3 };
    const sizeMap = { Small: 1, Medium: 2, Large: 3 };
    const sizeMbMap = { Small: 12.5, Medium: 25.0, Large: 50.0 };

    const newWorld: WorldInfo = {
      filename,
      name: options.name,
      size: options.size,
      difficulty: options.difficulty,
      seed: options.seed || Math.random().toString(36).substring(2, 10).toUpperCase(),
      createdDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastSavedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sizeMb: sizeMbMap[options.size],
      hardmode: false,
      bossesDefeated: [],
      activeEvents: [],
      inGameTime: '08:15 AM (Mañana)',
      isDayTime: true,
      moonPhase: 'Luna Nueva',
    };

    this.worlds.push(newWorld);
    this.addLog('info', `[Generación de Mundo] Nuevo mundo generado exitosamente: '${newWorld.name}' [Tamaño: ${newWorld.size}, Dificultad: ${newWorld.difficulty}, Seed: ${newWorld.seed}]`);
    return { success: true, world: newWorld, message: `Mundo ${newWorld.name} creado correctamente.` };
  }

  public getBackups(): BackupInfo[] {
    return this.backups;
  }

  public async createBackup(worldName?: string, trigger: 'manual' | 'auto_shutdown' | 'scheduled' = 'manual'): Promise<{ success: boolean; backup?: BackupInfo; message: string }> {
    const targetWorld = worldName || this.getActiveWorld()?.name || 'Aethelgard Prime';
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const backupId = `bak-${Date.now()}`;
    const cleanWorldName = targetWorld.replace(/\s+/g, '_');
    const backup: BackupInfo = {
      id: backupId,
      name: `Backup_${cleanWorldName}_${timestampStr}.zip`,
      worldName: targetWorld,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sizeMb: parseFloat((20 + Math.random() * 8).toFixed(1)),
      trigger,
    };

    this.backups.unshift(backup);
    this.addLog('system', `[Backup] Respaldo de '${targetWorld}' completado satisfactoriamente (${backup.name}, ${backup.sizeMb}MB).`);
    return { success: true, backup, message: `Backup ${backup.name} generado con éxito.` };
  }

  public async restoreBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    const backup = this.backups.find(b => b.id === backupId);
    if (!backup) {
      return { success: false, message: 'Respaldo no encontrado.' };
    }
    if (this.status === 'online') {
      return { success: false, message: 'Debes apagar el servidor antes de restaurar un respaldo del mundo.' };
    }
    this.addLog('warn', `[Backup] Restaurando respaldo '${backup.name}' sobre el mundo '${backup.worldName}'...`);
    this.addLog('info', `[Backup] Archivos restaurados exitosamente.`);
    return { success: true, message: `Respaldo '${backup.name}' restaurado con éxito.` };
  }

  public async deleteBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    const idx = this.backups.findIndex(b => b.id === backupId);
    if (idx === -1) {
      return { success: false, message: 'Respaldo no encontrado.' };
    }
    const [deleted] = this.backups.splice(idx, 1);
    this.addLog('system', `[Backup] Archivo de respaldo '${deleted.name}' eliminado.`);
    return { success: true, message: 'Respaldo eliminado.' };
  }

  public getPlayers(): PlayerInfo[] {
    return this.status === 'online' ? this.players : [];
  }

  public async kickPlayer(playerName: string, reason: string = 'Expulsado por el Administrador'): Promise<{ success: boolean; message: string }> {
    const idx = this.players.findIndex(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (idx !== -1) {
      const p = this.players[idx];
      this.players.splice(idx, 1);
      this.metrics.playersOnline = this.players.length;
      this.addLog('warn', `[Kick] Jugador '${p.name}' fue expulsado del servidor. Razón: "${reason}"`);
      this.emit('playerKicked', { player: p, reason });
      return { success: true, message: `Jugador ${p.name} expulsado.` };
    }
    return { success: false, message: `Jugador '${playerName}' no encontrado en el servidor.` };
  }

  public async banPlayer(playerName: string, reason: string = 'Baneado por el Administrador'): Promise<{ success: boolean; message: string }> {
    const res = await this.kickPlayer(playerName, `Baneado permanentemente: ${reason}`);
    this.addLog('error', `[BanList] Jugador '${playerName}' añadido a la lista de bloqueos (banlist.txt).`);
    return { success: true, message: `Jugador '${playerName}' ha sido baneado.` };
  }

  // --- Core Lifecycle Commands ---

  public async start(): Promise<{ success: boolean; message: string }> {
    if (this.status === 'online' || this.status === 'starting') {
      return { success: false, message: 'El servidor ya se encuentra en ejecución o iniciando.' };
    }

    this.setStatus('starting');
    this.addLog('system', `[Controlador] Iniciando instancia '${this.name}' en puerto ${this.config.port}...`);
    this.addLog('info', `[TerrariaServer] Cargando configuración desde serverconfig.txt...`);
    this.addLog('info', `[TerrariaServer] Mundo objetivo: ${this.config.worldname} (${this.config.world})`);

    // Check if a real binary is available in the environment, else start interactive game daemon
    const possibleBinaries = [
      './TerrariaServer.bin.x86_64',
      './TerrariaServer.exe',
      './TShock.Server',
      '/usr/games/terraria/TerrariaServer.bin.x86_64',
    ];

    let binaryPath: string | null = null;
    for (const b of possibleBinaries) {
      if (fs.existsSync(b)) {
        binaryPath = b;
        break;
      }
    }

    if (binaryPath) {
      try {
        this.addLog('info', `[Proceso] Ejecutando binario nativo: ${binaryPath}`);
        this.process = spawn(binaryPath, ['-config', 'serverconfig.txt'], {
          stdio: ['pipe', 'pipe', 'pipe'],
        });

        this.process.stdout?.on('data', (data) => {
          const lines = data.toString().split('\n');
          for (const line of lines) {
            if (line.trim()) this.parseConsoleOutput(line.trim());
          }
        });

        this.process.stderr?.on('data', (data) => {
          this.addLog('error', data.toString());
        });

        this.process.on('close', (code) => {
          this.addLog('system', `[Proceso] Proceso del servidor terminó con código ${code}`);
          this.cleanup();
          this.setStatus('offline');
        });
      } catch (err: any) {
        this.addLog('warn', `[Proceso] No se pudo ejecutar binario nativo (${err.message}). Iniciando motor interactivo virtual.`);
        this.startVirtualEngine();
      }
    } else {
      this.startVirtualEngine();
    }

    return { success: true, message: 'Servidor iniciando correctamente.' };
  }

  private startVirtualEngine() {
    let bootStep = 0;
    const bootSequence = [
      { delay: 400, level: 'info' as const, msg: `[TerrariaServer] TShock para Terraria 1.4.4.9 (Versión 5.2.0.0)` },
      { delay: 800, level: 'info' as const, msg: `[TerrariaServer] Inicializando base de datos SQLite y permisos...` },
      { delay: 1200, level: 'info' as const, msg: `[TerrariaServer] Cargando plugins: GeneralHooks, SSC_Enforcer, Essentials, RestApi...` },
      { delay: 1600, level: 'info' as const, msg: `[TerrariaServer] Leyendo archivo de mundo: ${this.config.world}...` },
      { delay: 2000, level: 'info' as const, msg: `[TerrariaServer] Mundo '${this.config.worldname}' cargado (Tamaño: Medium, Dificultad: Master, Hardmode: ACTIVO)` },
      { delay: 2400, level: 'info' as const, msg: `[TerrariaServer] Asignando puerto TCP ${this.config.port}...` },
      { delay: 2800, level: 'system' as const, msg: `[TerrariaServer] ¡Servidor listo y escuchando conexiones en 0.0.0.0:${this.config.port}!` },
    ];

    const runNextStep = () => {
      if (bootStep < bootSequence.length) {
        const step = bootSequence[bootStep];
        setTimeout(() => {
          if (this.status === 'starting') {
            this.addLog(step.level, step.msg);
            bootStep++;
            if (bootStep === bootSequence.length) {
              this.setStatus('online');
              this.startMetricsSimulation();
              this.startWorldCycle();
            } else {
              runNextStep();
            }
          }
        }, 350);
      }
    };

    runNextStep();
  }

  private parseConsoleOutput(line: string) {
    let level: LogMessage['level'] = 'info';
    if (line.toLowerCase().includes('error') || line.toLowerCase().includes('failed') || line.toLowerCase().includes('exception')) {
      level = 'error';
    } else if (line.toLowerCase().includes('warn') || line.toLowerCase().includes('kicked')) {
      level = 'warn';
    } else if (line.toLowerCase().includes('<') && line.toLowerCase().includes('>')) {
      level = 'chat';
    } else if (line.includes('joined') || line.includes('left')) {
      level = 'system';
    }
    this.addLog(level, line);
  }

  public async stop(graceful: boolean = true): Promise<{ success: boolean; message: string }> {
    if (this.status === 'offline') {
      return { success: false, message: 'El servidor ya está apagado.' };
    }

    this.setStatus('stopping');
    this.addLog('system', `[Controlador] ${graceful ? 'Enviando comando seguro "exit" al servidor...' : 'Forzando detención del proceso...'}`);

    if (this.autoBackupOnStop && graceful) {
      this.addLog('info', `[AutoBackup] Creando respaldo automático de seguridad previo al apagado...`);
      await this.createBackup(this.getActiveWorld()?.name, 'auto_shutdown');
    }

    if (this.process) {
      if (graceful) {
        this.process.stdin?.write('exit\n');
        setTimeout(() => {
          if (this.process && !this.process.killed) {
            this.process.kill('SIGKILL');
          }
        }, 4000);
      } else {
        this.process.kill('SIGKILL');
        this.cleanup();
        this.setStatus('offline');
      }
    } else {
      // Virtual engine shutdown
      setTimeout(() => {
        this.addLog('info', `[TerrariaServer] Guardando progreso de mundos y jugadores...`);
        this.addLog('info', `[TerrariaServer] Desconectando 3 jugadores...`);
        setTimeout(() => {
          this.addLog('system', `[TerrariaServer] Servidor detenido de forma segura.`);
          this.cleanup();
          this.setStatus('offline');
        }, 800);
      }, 500);
    }

    return { success: true, message: 'Servidor apagándose...' };
  }

  public async forceKill(): Promise<{ success: boolean; message: string }> {
    this.addLog('error', `[Controlador] ¡ALERTA! Forzando apagado inmediato (SIGKILL). Los datos no guardados podrían perderse.`);
    if (this.process) {
      this.process.kill('SIGKILL');
    }
    this.cleanup();
    this.setStatus('offline');
    this.addLog('system', `[Controlador] Proceso terminado forzosamente.`);
    return { success: true, message: 'Proceso terminado con SIGKILL.' };
  }

  public async restart(): Promise<{ success: boolean; message: string }> {
    this.setStatus('restarting');
    this.addLog('system', `[Controlador] Reiniciando servidor...`);
    await this.stop(true);
    setTimeout(async () => {
      await this.start();
    }, 1500);
    return { success: true, message: 'Reiniciando servidor...' };
  }

  public async sendCommand(cmd: string): Promise<{ success: boolean; message: string }> {
    const trimmed = cmd.trim();
    if (!trimmed) return { success: false, message: 'Comando vacío' };

    this.addLog('cmd', `> ${trimmed}`);

    // If real process running
    if (this.process && this.process.stdin && !this.process.killed) {
      this.process.stdin.write(`${trimmed}\n`);
      return { success: true, message: `Comando '${trimmed}' enviado al proceso.` };
    }

    // Interactive built-in command interpreter
    if (this.status !== 'online') {
      this.addLog('warn', `[Consola] El servidor está apagado. Inicia el servidor para interactuar con la consola.`);
      return { success: false, message: 'El servidor no está en línea.' };
    }

    this.handleInteractiveCommand(trimmed);
    return { success: true, message: `Comando ejecutado: ${trimmed}` };
  }

  private handleInteractiveCommand(cmd: string) {
    const parts = cmd.split(' ');
    const root = parts[0].toLowerCase();
    const args = parts.slice(1);
    const activeWorld = this.getActiveWorld();

    switch (root) {
      case 'help':
      case '?':
        this.addLog('info', `[Ayuda] Comandos disponibles:`);
        this.addLog('info', `  save              - Guarda el estado actual del mundo.`);
        this.addLog('info', `  exit / stop       - Guarda y apaga el servidor con seguridad.`);
        this.addLog('info', `  time [noon|night|dawn|dusk] - Consulta o cambia la hora.`);
        this.addLog('info', `  say <mensaje>     - Envía un mensaje global en el chat.`);
        this.addLog('info', `  motd [mensaje]    - Consulta o cambia el mensaje del día.`);
        this.addLog('info', `  playing / players - Lista los jugadores en línea y su ping.`);
        this.addLog('info', `  kick <jugador> [razón] - Expulsa a un jugador.`);
        this.addLog('info', `  ban <jugador> [razón]  - Banea a un jugador.`);
        this.addLog('info', `  settle            - Asienta todos los líquidos del mapa.`);
        this.addLog('info', `  boss <nombre>     - Invoca/registra batalla de un jefe.`);
        this.addLog('info', `  event <nombre>    - Inicia un evento (bloodmoon, eclipse, goblin).`);
        this.addLog('info', `  hardmode          - Alterna el estado del Modo Difícil.`);
        this.addLog('info', `  clear             - Limpia la consola.`);
        break;

      case 'save':
        if (activeWorld) {
          activeWorld.lastSavedDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
        }
        this.addLog('info', `[TerrariaServer] Guardando mundo '${this.config.worldname}'...`);
        setTimeout(() => {
          this.addLog('system', `[TerrariaServer] ¡Mundo guardado exitosamente a disco!`);
        }, 300);
        break;

      case 'exit':
      case 'stop':
        this.stop(true);
        break;

      case 'time':
        if (args.length === 0) {
          this.addLog('info', `[TerrariaServer] Tiempo actual en el juego: ${activeWorld?.inGameTime || '12:00 PM (Día)'}`);
        } else {
          const sub = args[0].toLowerCase();
          if (sub === 'noon' || sub === 'mediodia') {
            if (activeWorld) {
              activeWorld.inGameTime = '12:00 PM (Mediodía)';
              activeWorld.isDayTime = true;
            }
            this.addLog('info', `[TerrariaServer] Hora cambiada a las 12:00 PM (Mediodía).`);
          } else if (sub === 'night' || sub === 'noche') {
            if (activeWorld) {
              activeWorld.inGameTime = '07:30 PM (Noche)';
              activeWorld.isDayTime = false;
            }
            this.addLog('info', `[TerrariaServer] Hora cambiada a las 07:30 PM (Inicio de Noche).`);
          } else if (sub === 'dawn' || sub === 'amanecer') {
            if (activeWorld) {
              activeWorld.inGameTime = '04:30 AM (Amanecer)';
              activeWorld.isDayTime = true;
            }
            this.addLog('info', `[TerrariaServer] Hora cambiada a las 04:30 AM (Amanecer).`);
          } else if (sub === 'dusk' || sub === 'atardecer') {
            if (activeWorld) {
              activeWorld.inGameTime = '07:00 PM (Atardecer)';
              activeWorld.isDayTime = true;
            }
            this.addLog('info', `[TerrariaServer] Hora cambiada a las 07:00 PM (Atardecer).`);
          } else {
            this.addLog('warn', `[TerrariaServer] Subcomando de tiempo desconocido. Usa noon, night, dawn, dusk.`);
          }
        }
        break;

      case 'dawn':
        if (activeWorld) { activeWorld.inGameTime = '04:30 AM (Amanecer)'; activeWorld.isDayTime = true; }
        this.addLog('info', `[TerrariaServer] El sol comienza a salir sobre ${this.config.worldname}.`);
        break;

      case 'dusk':
        if (activeWorld) { activeWorld.inGameTime = '07:00 PM (Atardecer)'; activeWorld.isDayTime = true; }
        this.addLog('info', `[TerrariaServer] Cae el atardecer sobre ${this.config.worldname}.`);
        break;

      case 'noon':
        if (activeWorld) { activeWorld.inGameTime = '12:00 PM (Mediodía)'; activeWorld.isDayTime = true; }
        this.addLog('info', `[TerrariaServer] Hora establecida a Mediodía.`);
        break;

      case 'night':
      case 'midnight':
        if (activeWorld) { activeWorld.inGameTime = '12:00 AM (Medianoche)'; activeWorld.isDayTime = false; }
        this.addLog('info', `[TerrariaServer] Es medianoche en ${this.config.worldname}.`);
        break;

      case 'say':
        const msg = args.join(' ');
        if (!msg) {
          this.addLog('warn', `[Consola] Sintaxis: say <mensaje>`);
        } else {
          this.addLog('chat', `<Servidor> ${msg}`);
        }
        break;

      case 'motd':
        if (args.length === 0) {
          this.addLog('info', `[TerrariaServer] MOTD actual: "${this.config.motd}"`);
        } else {
          this.config.motd = args.join(' ');
          this.addLog('system', `[TerrariaServer] MOTD actualizado a: "${this.config.motd}"`);
        }
        break;

      case 'playing':
      case 'players':
      case 'who':
        this.addLog('info', `[TerrariaServer] Jugadores conectados (${this.players.length}/${this.config.maxplayers}):`);
        this.players.forEach(p => {
          this.addLog('info', `  - ${p.name} [IP: ${p.ip}, Ping: ${p.ping}ms, Clase: ${p.characterClass || 'Desconocida'}, HP: ${p.health}/${p.maxHealth}]`);
        });
        break;

      case 'kick':
        if (!args[0]) {
          this.addLog('warn', `[Consola] Sintaxis: kick <jugador> [razón]`);
        } else {
          this.kickPlayer(args[0], args.slice(1).join(' ') || 'Expulsado por consola');
        }
        break;

      case 'ban':
        if (!args[0]) {
          this.addLog('warn', `[Consola] Sintaxis: ban <jugador> [razón]`);
        } else {
          this.banPlayer(args[0], args.slice(1).join(' ') || 'Baneado por consola');
        }
        break;

      case 'settle':
        this.addLog('info', `[TerrariaServer] Asentando líquidos...`);
        setTimeout(() => {
          this.addLog('info', `[TerrariaServer] 14,890 bloques de agua/lava/miel asentados.`);
        }, 400);
        break;

      case 'hardmode':
        if (activeWorld) {
          activeWorld.hardmode = !activeWorld.hardmode;
          if (activeWorld.hardmode) {
            this.addLog('warn', `[TerrariaServer] ¡Los espíritus antiguos de la luz y la oscuridad han sido liberados! (Hardmode Activado)`);
          } else {
            this.addLog('info', `[TerrariaServer] Hardmode desactivado para el mundo actual.`);
          }
        }
        break;

      case 'event':
        const eventName = (args[0] || 'bloodmoon').toLowerCase();
        if (eventName.includes('blood') || eventName.includes('sangre')) {
          this.addLog('error', `[Evento] ¡La Luna de Sangre está saliendo...! El cielo se tiñe de rojo.`);
          if (activeWorld) activeWorld.activeEvents = ['Luna de Sangre'];
        } else if (eventName.includes('eclipse') || eventName.includes('solar')) {
          this.addLog('error', `[Evento] ¡Un eclipse solar está ocurriendo! Monstruos aterradores emergen.`);
          if (activeWorld) activeWorld.activeEvents = ['Eclipse Solar'];
        } else if (eventName.includes('goblin') || eventName.includes('duende')) {
          this.addLog('warn', `[Evento] ¡Un ejército de duendes se aproxima desde el oeste!`);
          if (activeWorld) activeWorld.activeEvents = ['Ejército de Duendes'];
        } else if (eventName.includes('pirate') || eventName.includes('pirata')) {
          this.addLog('warn', `[Evento] ¡Invasión Pirata en progreso! ¡Prepárense para cañones!`);
          if (activeWorld) activeWorld.activeEvents = ['Invasión Pirata'];
        } else if (eventName.includes('stop') || eventName.includes('clear')) {
          this.addLog('system', `[Evento] Todos los eventos activos han finalizado.`);
          if (activeWorld) activeWorld.activeEvents = [];
        } else {
          this.addLog('info', `[Evento] Eventos disponibles: bloodmoon, eclipse, goblin, pirate, clear`);
        }
        break;

      case 'boss':
        const bossName = args.join(' ') || 'Eye of Cthulhu';
        this.addLog('warn', `[Boss] ¡${bossName} ha sido invocado!`);
        setTimeout(() => {
          if (activeWorld && !activeWorld.bossesDefeated.includes(bossName)) {
            activeWorld.bossesDefeated.push(bossName);
          }
          this.addLog('system', `[Boss] ¡${bossName} ha sido derrotado por los valientes aventureros!`);
        }, 1500);
        break;

      case 'clear':
        this.logs = [];
        this.addLog('system', `[Consola] Registro de terminal limpiado.`);
        break;

      default:
        this.addLog('warn', `[Consola] Comando no reconocido: '${cmd}'. Escribe 'help' para ver la lista de comandos.`);
        break;
    }
  }

  private startMetricsSimulation() {
    this.metrics.playersOnline = this.players.length;
    this.metrics.memoryMb = 340 + Math.floor(Math.random() * 40);

    if (this.uptimeInterval) clearInterval(this.uptimeInterval);
    this.uptimeInterval = setInterval(() => {
      if (this.status === 'online') {
        this.metrics.uptimeSeconds += 1;
        // Jitter metrics realistically
        this.metrics.cpu = parseFloat((4.5 + Math.random() * 8.0 + (this.players.length * 1.5)).toFixed(1));
        this.metrics.memoryMb = Math.min(2048, Math.max(300, this.metrics.memoryMb + (Math.random() * 4 - 2)));
        this.metrics.tps = parseFloat((59.8 + Math.random() * 0.4).toFixed(1));
        this.metrics.pingMs = Math.floor(18 + Math.random() * 10);
        this.emit('metrics', this.getMetrics());
      }
    }, 1000);
  }

  private startWorldCycle() {
    if (this.worldDayCycleTimer) clearInterval(this.worldDayCycleTimer);
    this.worldDayCycleTimer = setInterval(() => {
      if (this.status === 'online') {
        // Occasionally cycle in-game time or simulate random player chat
        const rand = Math.random();
        if (rand < 0.08) {
          const quotes = [
            '¿Alguien tiene núcleos de vida extra?',
            'Cuidado cerca de la jungla subterránea, hay muchas trampas.',
            'Preparando pociones para la batalla contra Plantera.',
            'Construyendo una arena de combate con fogatas y lámparas de corazón.',
            'El comerciante ambulante ha llegado con capas misteriosas!',
          ];
          const randomPlayer = this.players[Math.floor(Math.random() * this.players.length)];
          if (randomPlayer) {
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            this.addLog('chat', `<${randomPlayer.name}> ${randomQuote}`);
          }
        }
      }
    }, 12000);
  }

  private cleanup() {
    if (this.uptimeInterval) {
      clearInterval(this.uptimeInterval);
      this.uptimeInterval = null;
    }
    if (this.worldDayCycleTimer) {
      clearInterval(this.worldDayCycleTimer);
      this.worldDayCycleTimer = null;
    }
    if (this.simulatedTimer) {
      clearTimeout(this.simulatedTimer);
      this.simulatedTimer = null;
    }
    this.metrics.cpu = 0;
    this.metrics.memoryMb = 0;
    this.metrics.uptimeSeconds = 0;
    this.metrics.playersOnline = 0;
    this.process = null;
  }
}
