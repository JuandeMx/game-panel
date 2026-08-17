import React from 'react';
import { 
  Layers, 
  Code2, 
  Cpu, 
  Boxes, 
  Terminal, 
  Sparkles,
  Server
} from 'lucide-react';

export const ArchitectureTab: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-[#111318] border border-white/5 p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Arquitectura Modular Multijuego (GameAdapter Pattern)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Diseño desacoplado extensible estilo Pterodactyl / AMP. Cualquier motor de videojuego (Terraria, Minecraft, Rust, Palworld) se conecta implementando la interfaz común.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Component Flow Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Layer 1 */}
        <div className="bg-[#111318] border border-white/5 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            1. Frontend & WebSockets
          </div>
          <p className="text-xs text-slate-400">
            React SPA se conecta vía WebSockets bidireccionales y REST API para transmitir logs, métricas (CPU/RAM) y comandos interactivos.
          </p>
        </div>

        {/* Layer 2 */}
        <div className="bg-[#111318] border border-white/5 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            2. Process Manager
          </div>
          <p className="text-xs text-slate-400">
            Enrutador de instancias que administra el ciclo de vida de los procesos, el registro de servidores y las suscripciones de clientes.
          </p>
        </div>

        {/* Layer 3 */}
        <div className="bg-[#111318] border border-white/5 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <Boxes className="w-4 h-4" />
            3. IGameAdapter Interface
          </div>
          <p className="text-xs text-slate-400">
            Contrato TypeScript con métodos estándar (<code className="text-purple-300">start</code>, <code className="text-purple-300">stop</code>, <code className="text-purple-300">sendCommand</code>, <code className="text-purple-300">getWorlds</code>, <code className="text-purple-300">createBackup</code>).
          </p>
        </div>

        {/* Layer 4 */}
        <div className="bg-[#111318] border border-white/5 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Server className="w-4 h-4" />
            4. Game Binary / Daemon
          </div>
          <p className="text-xs text-slate-400">
            Maneja la ejecución nativa con <code className="text-amber-300 font-mono">child_process.spawn</code> canalizando STDIN/STDOUT o emulando el protocolo interactivo.
          </p>
        </div>

      </div>

      {/* Code Sample / Interface Inspector */}
      <div className="bg-black border border-white/5 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white font-mono">
              server/types.ts — Interfaz IGameAdapter
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-emerald-400 border border-emerald-500/30">
            TypeScript 5.8
          </span>
        </div>

        <div className="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed bg-[#111318] p-4 rounded-xl border border-white/5">
          <pre>{`export interface IGameAdapter extends EventEmitter {
  readonly id: string;
  readonly name: string;
  readonly gameType: 'terraria_vanilla' | 'terraria_tshock' | 'minecraft' | 'rust';
  readonly port: number;

  // Ciclo de Vida y Procesos
  start(): Promise<{ success: boolean; message: string }>;
  stop(graceful?: boolean): Promise<{ success: boolean; message: string }>;
  restart(): Promise<{ success: boolean; message: string }>;
  forceKill(): Promise<{ success: boolean; message: string }>;
  sendCommand(command: string): Promise<{ success: boolean; message: string }>;

  // Métricas y Logs en Tiempo Real
  getStatus(): ServerStatus;
  getMetrics(): ServerMetrics; // CPU %, RAM, TPS, Ping
  getLogs(limit?: number): LogMessage[];

  // Configuración y Archivos de Motor (serverconfig.txt, server.properties)
  getConfig(): Record<string, any>;
  saveConfig(config: Record<string, any>): Promise<{ success: boolean; message: string }>;

  // Gestión de Mundos (.wld, level-name) y Respaldos (.zip)
  getWorlds(): WorldInfo[];
  createWorld(options: WorldOptions): Promise<{ success: boolean; world?: WorldInfo }>;
  createBackup(worldName?: string, trigger?: string): Promise<{ success: boolean; backup?: BackupInfo }>;
  restoreBackup(backupId: string): Promise<{ success: boolean; message: string }>;

  // Moderación de Jugadores
  getPlayers(): PlayerInfo[];
  kickPlayer(name: string, reason?: string): Promise<{ success: boolean; message: string }>;
  banPlayer(name: string, reason?: string): Promise<{ success: boolean; message: string }>;
}`}</pre>
        </div>
      </div>

      {/* Guide for adding a new game */}
      <div className="bg-[#111318] border border-white/5 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          ¿Cómo añadir un nuevo juego (ej. Rust, Palworld, Factorio)?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-1.5">
            <span className="font-bold text-emerald-400 font-mono">Paso 1: Crear Adapter</span>
            <p className="text-slate-400">
              Crea <code className="text-slate-200">server/adapters/RustAdapter.ts</code> extendiendo <code className="text-slate-200">BaseGameAdapter</code>.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-1.5">
            <span className="font-bold text-blue-400 font-mono">Paso 2: Definir Parser & I/O</span>
            <p className="text-slate-400">
              Implementa los comandos nativos de inicio/parada (<code className="text-slate-200">quit</code> / <code className="text-slate-200">save</code>) y el parser de logs.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-1.5">
            <span className="font-bold text-purple-400 font-mono">Paso 3: Registrar en ProcessManager</span>
            <p className="text-slate-400">
              Agrega la clase al diccionario de fábricas en <code className="text-slate-200">ProcessManager.ts</code> y aparecerá automáticamente en el selector del panel.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
