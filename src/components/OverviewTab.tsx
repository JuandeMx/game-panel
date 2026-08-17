import React, { useState } from 'react';
import { 
  Cpu, 
  HardDrive, 
  Users, 
  Clock, 
  Activity, 
  Sun, 
  Moon, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  Save, 
  MessageSquare, 
  Radio, 
  Compass, 
  Flame,
  Zap,
  Globe2,
  FolderArchive
} from 'lucide-react';
import { GameServerInstance, WorldInfo, ServerMetrics } from '../types';

interface OverviewTabProps {
  server: GameServerInstance;
  metrics: ServerMetrics;
  activeWorld: WorldInfo | null;
  onSendCommand: (command: string) => void;
  onPowerAction: (action: 'start' | 'stop' | 'restart' | 'force_kill') => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  server,
  metrics,
  activeWorld,
  onSendCommand,
  onPowerAction,
}) => {
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);

  const formatUptime = (seconds: number) => {
    if (seconds <= 0) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    onSendCommand(`say ${broadcastMsg}`);
    setBroadcastMsg('');
  };

  const memoryPercent = Math.min(100, Math.round((metrics.memoryMb / (metrics.maxMemoryMb || 2048)) * 100));

  const totalPreHardmodeBosses = 7;
  const preHardmodeDefeated = (activeWorld?.bossesDefeated || []).filter(b => 
    ['King Slime', 'Eye of Cthulhu', 'Eater of Worlds', 'Brain of Cthulhu', 'Queen Bee', 'Skeletron', 'Wall of Flesh'].includes(b)
  ).length;

  return (
    <div className="space-y-6">
      
      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CPU Metric */}
        <div className="bg-[#111318] border border-white/5 rounded-xl p-5 relative overflow-hidden group hover:border-white/10 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Uso de CPU</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {server.status === 'online' ? `${metrics.cpu.toFixed(1)}%` : '0.0%'}
            </span>
            <span className="text-xs text-slate-400">
              {server.status === 'online' ? (metrics.cpu > 50 ? 'Carga Alta' : 'Estable') : 'Inactivo'}
            </span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                metrics.cpu > 75 ? 'bg-rose-500' : metrics.cpu > 40 ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${server.status === 'online' ? metrics.cpu : 0}%` }}
            />
          </div>
        </div>

        {/* RAM Metric */}
        <div className="bg-[#111318] border border-white/5 rounded-xl p-5 relative overflow-hidden group hover:border-white/10 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Memoria RAM</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {server.status === 'online' ? `${Math.round(metrics.memoryMb)} MB` : '0 MB'}
            </span>
            <span className="text-xs text-slate-400">/ {metrics.maxMemoryMb || 2048} MB</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-sky-500 transition-all duration-500"
              style={{ width: `${server.status === 'online' ? memoryPercent : 0}%` }}
            />
          </div>
        </div>

        {/* Players Online */}
        <div className="bg-[#111318] border border-white/5 rounded-xl p-5 relative overflow-hidden group hover:border-white/10 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Jugadores Activos</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {server.status === 'online' ? metrics.playersOnline : 0}
            </span>
            <span className="text-xs text-slate-400">/ {metrics.maxPlayers || 16} slots</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${server.status === 'online' ? (metrics.playersOnline / (metrics.maxPlayers || 16)) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Uptime & TPS */}
        <div className="bg-[#111318] border border-white/5 rounded-xl p-5 relative overflow-hidden group hover:border-white/10 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tiempo de Actividad</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {formatUptime(metrics.uptimeSeconds)}
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Tickrate (TPS): <strong className="text-emerald-400">{server.status === 'online' ? metrics.tps : '0.0'}</strong></span>
            <span>Ping: <strong className="text-sky-400">{server.status === 'online' ? `${metrics.pingMs}ms` : '--'}</strong></span>
          </div>
        </div>

      </div>

      {/* Main Content Grid: Active World Details + Server Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active World Card */}
        <div className="lg:col-span-2 bg-[#111318] border border-white/5 rounded-xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">
                  Mundo Activo: {activeWorld?.name || server.activeWorld}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Archivo: <span className="font-mono text-slate-300">{activeWorld?.filename || 'world.wld'}</span> • {activeWorld?.sizeMb} MB
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase font-mono ${
                activeWorld?.difficulty === 'Master' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                activeWorld?.difficulty === 'Expert' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                'bg-sky-500/10 text-sky-300 border border-sky-500/20'
              }`}>
                Modo {activeWorld?.difficulty || 'Master'}
              </span>

              <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                activeWorld?.hardmode 
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20' 
                  : 'bg-white/5 text-slate-400 border border-white/10'
              }`}>
                {activeWorld?.hardmode ? '🔥 Hardmode ACTIVO' : '🌱 Pre-Hardmode'}
              </span>
            </div>
          </div>

          {/* In-Game State & Time Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-black/40 rounded-xl p-3.5 border border-white/5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                {activeWorld?.isDayTime ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Hora en el Mundo</div>
                <div className="text-sm font-semibold text-white">
                  {server.status === 'online' ? (activeWorld?.inGameTime || '12:00 PM (Día)') : 'Servidor Apagado'}
                </div>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-3.5 border border-white/5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Semilla (Seed)</div>
                <div className="text-sm font-mono font-semibold text-emerald-300 truncate max-w-[120px]">
                  {activeWorld?.seed || 'RandomSeed'}
                </div>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-3.5 border border-white/5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Eventos Activos</div>
                <div className="text-sm font-semibold text-white">
                  {activeWorld?.activeEvents && activeWorld.activeEvents.length > 0 
                    ? activeWorld.activeEvents.join(', ') 
                    : 'Ninguno (Tranquilo)'}
                </div>
              </div>
            </div>
          </div>

          {/* World Progression Summary */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Progreso de Jefes Derrotados en este Mundo
              </span>
              <span className="font-mono text-emerald-400 font-semibold">
                {activeWorld?.bossesDefeated?.length || 0} / 12 Jefes
              </span>
            </div>
            
            <div className="w-full bg-black/50 h-2.5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500"
                style={{ width: `${Math.min(100, (((activeWorld?.bossesDefeated?.length || 0) / 12) * 100))}%` }}
              />
            </div>

            {/* Defeated Boss Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {activeWorld?.bossesDefeated && activeWorld.bossesDefeated.length > 0 ? (
                activeWorld.bossesDefeated.map(boss => (
                  <span key={boss} className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-white/5 text-emerald-300 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {boss}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No se han registrado derrotas de jefes todavía.</span>
              )}
            </div>
          </div>

          {/* Quick World Interactions Bar */}
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 mr-1">Comandos Rápidos:</span>
            
            <button
              id="quick-cmd-save"
              disabled={server.status !== 'online'}
              onClick={() => onSendCommand('save')}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              Guardar Mundo
            </button>

            <button
              id="quick-cmd-dawn"
              disabled={server.status !== 'online'}
              onClick={() => onSendCommand('dawn')}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Amanecer (4:30 AM)
            </button>

            <button
              id="quick-cmd-noon"
              disabled={server.status !== 'online'}
              onClick={() => onSendCommand('noon')}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Sun className="w-3.5 h-3.5 text-yellow-400" />
              Mediodía
            </button>

            <button
              id="quick-cmd-night"
              disabled={server.status !== 'online'}
              onClick={() => onSendCommand('time night')}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              Noche (7:30 PM)
            </button>

            <button
              id="quick-cmd-bloodmoon"
              disabled={server.status !== 'online'}
              onClick={() => onSendCommand('event bloodmoon')}
              className="px-2.5 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-xs font-medium text-rose-300 hover:text-rose-100 border border-rose-600/20 flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Luna de Sangre
            </button>
          </div>

        </div>

        {/* Server Information & Chat Broadcast */}
        <div className="space-y-6">
          
          {/* Server Details Spec Box */}
          <div className="bg-[#111318] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Especificaciones de la Instancia
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-500">Motor de Juego</span>
                <span className="font-medium text-white">{server.gameTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-500">Versión</span>
                <span className="font-mono text-emerald-400">{server.version}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-500">Puerto Vinculado</span>
                <span className="font-mono text-white">{server.port} / TCP</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-500">Auto-Backup al Apagar</span>
                <span className={`font-semibold ${server.autoBackupOnStop ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {server.autoBackupOnStop ? 'Activado' : 'Desactivado'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">MOTD</span>
                <span className="text-slate-300 italic truncate max-w-[170px]" title={server.config?.motd}>
                  "{server.config?.motd || 'Bienvenido a Terraria'}"
                </span>
              </div>
            </div>
          </div>

          {/* Quick Chat Broadcast Box */}
          <div className="bg-[#111318] border border-white/5 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Anuncio Global al Servidor
            </h3>
            <p className="text-xs text-slate-400">
              Envía un mensaje en vivo al chat que verán todos los jugadores conectados.
            </p>

            <form onSubmit={handleBroadcast} className="flex gap-2">
              <input
                type="text"
                id="input-broadcast-msg"
                disabled={server.status !== 'online'}
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Escribe mensaje..."
                className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 disabled:opacity-50"
              />
              <button
                type="submit"
                id="btn-submit-broadcast"
                disabled={server.status !== 'online' || !broadcastMsg.trim()}
                className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors disabled:opacity-40 cursor-pointer"
              >
                Enviar
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
