import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  RotateCw, 
  Skull, 
  Server, 
  ChevronDown, 
  Copy, 
  Check, 
  Plus, 
  Wifi, 
  ShieldCheck,
  Gamepad2,
  Boxes
} from 'lucide-react';
import { GameServerInstance, ServerStatus } from '../types';

interface NavbarProps {
  servers: GameServerInstance[];
  activeServer: GameServerInstance | null;
  onSelectServer: (serverId: string) => void;
  onPowerAction: (action: 'start' | 'stop' | 'restart' | 'force_kill') => void;
  onOpenNewServerModal: () => void;
  wsConnected: boolean;
  powerLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  servers,
  activeServer,
  onSelectServer,
  onPowerAction,
  onOpenNewServerModal,
  wsConnected,
  powerLoading,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const status = activeServer?.status || 'offline';

  const getStatusBadge = (st: ServerStatus) => {
    switch (st) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            En Línea
          </span>
        );
      case 'starting':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-spin" />
            Iniciando...
          </span>
        );
      case 'stopping':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
            Apagando...
          </span>
        );
      case 'restarting':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-300 border border-sky-500/20">
            <RotateCw className="h-3 w-3 animate-spin text-sky-400" />
            Reiniciando...
          </span>
        );
      case 'offline':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-white/5 text-slate-400 border border-white/10">
            <span className="h-2 w-2 rounded-full bg-slate-500" />
            Apagado
          </span>
        );
    }
  };

  const copyConnectionAddress = () => {
    if (!activeServer) return;
    const addr = `${activeServer.host || '127.0.0.1'}:${activeServer.port}`;
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-[#0b0d11] border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Server Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 text-slate-950 font-black text-lg">
                <Gamepad2 className="w-5 h-5 text-slate-950" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  Nexus<span className="text-emerald-400">Panel</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-emerald-400 border border-emerald-500/20 font-bold">
                    GameOps
                  </span>
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-white/5 hidden md:block" />

            {/* Server Dropdown */}
            <div className="relative">
              <button
                id="server-selector-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#111318] hover:bg-white/5 border border-white/10 text-sm font-medium text-slate-200 transition-all shadow-sm cursor-pointer"
              >
                <Server className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-semibold text-white truncate max-w-[140px] sm:max-w-[200px]">
                    {activeServer?.name || 'Seleccionar Servidor'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <span>:{activeServer?.port || 7777}</span>
                    <span>•</span>
                    <span className="capitalize">{activeServer?.gameType.replace('_', ' ') || 'Terraria'}</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute left-0 mt-2 w-72 rounded-xl bg-[#111318] border border-white/10 shadow-2xl z-30 py-2 overflow-hidden">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      Instancias Activas
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {servers.map((srv) => (
                        <button
                          key={srv.id}
                          id={`select-server-${srv.id}`}
                          onClick={() => {
                            onSelectServer(srv.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer ${
                            activeServer?.id === srv.id ? 'bg-emerald-500/10 border-l-2 border-emerald-400' : ''
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="text-xs font-medium text-white truncate">{srv.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Puerto {srv.port} • {srv.version}
                            </div>
                          </div>
                          <div className="shrink-0">{getStatusBadge(srv.status)}</div>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-white/5 mt-1 pt-1 px-2">
                      <button
                        id="add-server-modal-btn"
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenNewServerModal();
                        }}
                        className="w-full text-left px-2 py-1.5 rounded text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Añadir Nuevo Servidor (Minecraft / Terraria)
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Active Status Badge */}
            {activeServer && getStatusBadge(status)}
          </div>

          {/* Quick Connect & Power Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* IP Copy Button */}
            {activeServer && (
              <button
                id="copy-ip-btn"
                onClick={copyConnectionAddress}
                title="Copiar dirección de conexión al servidor"
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111318] hover:bg-white/5 border border-white/10 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
              >
                <Wifi className={`w-3.5 h-3.5 ${wsConnected ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span>{activeServer.host || '127.0.0.1'}:{activeServer.port}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            )}

            {/* Power Action Buttons */}
            <div className="flex items-center gap-1.5 bg-[#090a0c] p-1 rounded-xl border border-white/10 shadow-inner">
              {status === 'offline' ? (
                <button
                  id="btn-start-server"
                  disabled={powerLoading}
                  onClick={() => onPowerAction('start')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/10 disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Iniciar</span>
                </button>
              ) : (
                <>
                  <button
                    id="btn-stop-server"
                    disabled={powerLoading || status === 'stopping'}
                    onClick={() => onPowerAction('stop')}
                    title="Apagado Seguro: guarda mundos y ejecuta auto-respaldo"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 font-semibold text-xs border border-rose-600/20 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Apagar</span>
                  </button>

                  <button
                    id="btn-restart-server"
                    disabled={powerLoading || status === 'restarting'}
                    onClick={() => onPowerAction('restart')}
                    title="Reiniciar Servidor"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs border border-white/10 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reiniciar</span>
                  </button>

                  <button
                    id="btn-force-kill-server"
                    disabled={powerLoading}
                    onClick={() => onPowerAction('force_kill')}
                    title="Forzar Apagado (SIGKILL)"
                    className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-rose-900/40 hover:border-rose-700/50 transition-colors cursor-pointer"
                  >
                    <Skull className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
