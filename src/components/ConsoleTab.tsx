import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Send, 
  Trash2, 
  Download, 
  Search, 
  Lock, 
  Unlock, 
  HelpCircle, 
  Sparkles,
  Check,
  Copy,
  Flame,
  Zap,
  Clock
} from 'lucide-react';
import { LogMessage, ServerStatus } from '../types';

interface ConsoleTabProps {
  logs: LogMessage[];
  serverStatus: ServerStatus;
  onSendCommand: (command: string) => void;
  onClearLogs: () => void;
}

export const ConsoleTab: React.FC<ConsoleTabProps> = ({
  logs,
  serverStatus,
  onSendCommand,
  onClearLogs,
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom on new logs
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    onSendCommand(cmd);

    // Update command history
    setCommandHistory((prev) => [cmd, ...prev.filter(c => c !== cmd)].slice(0, 50));
    setHistoryIndex(-1);
    setCommandInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(nextIndex);
        setCommandInput(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setCommandInput(commandHistory[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return log.message.toLowerCase().includes(q) || log.level.toLowerCase().includes(q);
  });

  const getLogStyle = (level: LogMessage['level']) => {
    switch (level) {
      case 'error':
        return 'text-rose-400 bg-rose-950/30 border-l-2 border-rose-500 pl-2';
      case 'warn':
        return 'text-amber-300 bg-amber-950/20 border-l-2 border-amber-500 pl-2';
      case 'cmd':
        return 'text-emerald-300 font-bold bg-emerald-950/20 border-l-2 border-emerald-500 pl-2';
      case 'chat':
        return 'text-purple-300 font-medium bg-purple-950/20 border-l-2 border-purple-500 pl-2';
      case 'system':
        return 'text-cyan-300 font-semibold bg-cyan-950/20 border-l-2 border-cyan-500 pl-2';
      case 'info':
      default:
        return 'text-slate-300';
    }
  };

  const copyAllLogs = () => {
    const raw = logs.map(l => `[${l.timestamp.substring(11, 19)}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadLogs = () => {
    const raw = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([raw], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `server_console_${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickCommands = [
    { label: 'help', cmd: 'help', icon: HelpCircle },
    { label: 'save', cmd: 'save', icon: Sparkles },
    { label: 'playing', cmd: 'playing', icon: null },
    { label: 'time noon', cmd: 'time noon', icon: Clock },
    { label: 'time night', cmd: 'time night', icon: Clock },
    { label: 'settle', cmd: 'settle', icon: Zap },
    { label: 'motd', cmd: 'motd', icon: null },
    { label: 'event bloodmoon', cmd: 'event bloodmoon', icon: Flame },
    { label: 'hardmode', cmd: 'hardmode', icon: null },
  ];

  return (
    <div className="space-y-4">
      
      {/* Console Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111318] border border-white/5 p-3 rounded-xl">
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-white/5 text-xs font-mono text-emerald-400 font-semibold">
            <Terminal className="w-3.5 h-3.5" />
            <span>STDIN / STDOUT (Interactivo)</span>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            {logs.length} líneas registradas
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          
          {/* Search Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="console-search-filter"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar logs..."
              className="pl-8 pr-2.5 py-1 text-xs rounded-lg bg-black/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/70 w-32 sm:w-44"
            />
          </div>

          {/* Auto Scroll Toggle */}
          <button
            id="toggle-autoscroll-btn"
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? 'Bloqueo automático de scroll activado' : 'Scroll libre'}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              autoScroll
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            {autoScroll ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span className="hidden md:inline text-[11px]">Auto-scroll</span>
          </button>

          {/* Copy Logs */}
          <button
            id="copy-logs-btn"
            onClick={copyAllLogs}
            title="Copiar contenido de la consola"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {/* Download Logs */}
          <button
            id="download-logs-btn"
            onClick={downloadLogs}
            title="Descargar archivo de registro (.log)"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear Console */}
          <button
            id="clear-logs-btn"
            onClick={onClearLogs}
            title="Limpiar registro en pantalla"
            className="p-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 border border-rose-600/20 text-rose-400 hover:text-rose-300 text-xs transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

      {/* Terminal Viewport */}
      <div className="bg-black border border-white/5 rounded-xl p-4 shadow-2xl font-mono text-xs overflow-hidden flex flex-col h-[520px]">
        
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5 text-slate-500 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-slate-400 font-medium">terminal@gameserver:~#</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${serverStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span>{serverStatus === 'online' ? 'Proceso Activo' : 'Desconectado'}</span>
          </div>
        </div>

        {/* Scrollable Logs Container */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1.5 terminal-scroll select-text">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 italic text-center p-6">
              <Terminal className="w-8 h-8 text-slate-700 mb-2" />
              <span>No hay logs disponibles o el filtro no coincide.</span>
              <span className="text-[11px] text-slate-600 mt-1">Inicia el servidor o envía un comando abajo.</span>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const timeFormatted = log.timestamp ? log.timestamp.substring(11, 19) : '--:--:--';
              return (
                <div
                  key={log.id}
                  className={`leading-relaxed py-0.5 px-1 rounded hover:bg-white/5 transition-colors flex items-start gap-2.5 break-all ${getLogStyle(
                    log.level
                  )}`}
                >
                  <span className="text-slate-500 select-none text-[10px] shrink-0 pt-0.5">
                    [{timeFormatted}]
                  </span>
                  <span className="flex-1 font-mono">{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={logsEndRef} />
        </div>

        {/* Interactive Command Input Form */}
        <div className="mt-3 pt-3 border-t border-white/5">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="text-emerald-400 font-bold pl-1 select-none flex items-center gap-1">
              <span>❯</span>
            </div>
            
            <input
              ref={inputRef}
              type="text"
              id="terminal-command-input"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={serverStatus === 'online' ? "Escribe un comando de Terraria (ej: save, time noon, say ¡Hola!, help)..." : "El servidor está apagado. Inícialo para enviar comandos."}
              className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-slate-600"
            />

            <button
              type="submit"
              id="terminal-send-btn"
              disabled={!commandInput.trim()}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Enviar</span>
            </button>
          </form>
        </div>

      </div>

      {/* Quick Command Suggestions Chips */}
      <div className="bg-[#111318] border border-white/5 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white">Accesos Directos de Comandos (STDIN)</span>
          <span className="text-[11px] text-slate-500">Haz clic para ejecutar directamente</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickCommands.map((q) => {
            const Icon = q.icon;
            return (
              <button
                key={q.cmd}
                id={`quick-chip-${q.label.replace(/\s+/g, '-')}`}
                onClick={() => onSendCommand(q.cmd)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30 text-xs font-mono text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {Icon && <Icon className="w-3 h-3 text-emerald-400" />}
                <span>{q.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
