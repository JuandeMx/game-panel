import React, { useState } from 'react';
import { Plus, X, Server } from 'lucide-react';
import { GameType } from '../types';

interface NewServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateServer: (serverData: { name: string; gameType: GameType; port: number }) => Promise<void>;
}

export const NewServerModal: React.FC<NewServerModalProps> = ({
  isOpen,
  onClose,
  onCreateServer,
}) => {
  const [name, setName] = useState('Terraria Calamity Realm');
  const [gameType, setGameType] = useState<GameType>('terraria_tshock');
  const [port, setPort] = useState(7779);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !port) return;

    setLoading(true);
    try {
      await onCreateServer({ name, gameType, port: Number(port) });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const gameOptions = [
    {
      id: 'terraria_tshock' as GameType,
      title: 'Terraria (TShock API 5.2)',
      desc: 'Servidor con soporte de plugins, permisos, SQLite y SSC.',
      defaultPort: 7777,
    },
    {
      id: 'terraria_vanilla' as GameType,
      title: 'Terraria Vanilla (1.4.4.9)',
      desc: 'Servidor oficial sin modificaciones ni plugins.',
      defaultPort: 7778,
    },
    {
      id: 'minecraft' as GameType,
      title: 'Minecraft (PaperMC 1.20.4)',
      desc: 'Servidor optimizado para SMP con soporte de plugins Bukkit.',
      defaultPort: 25565,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111318] border border-white/10 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Crear Nueva Instancia de Servidor</h3>
              <p className="text-xs text-slate-400">Añade un nuevo contenedor de juego al panel de gestión.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Server Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Nombre de la Instancia
            </label>
            <input
              type="text"
              id="new-server-name-input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Terraria Survival Hardmode"
              className="w-full px-3.5 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Game Type Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Tipo de Videojuego & Motor
            </label>
            <div className="space-y-2">
              {gameOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    gameType === opt.id
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                      : 'bg-black/50 border-white/5 text-slate-400 hover:border-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="gameType"
                    checked={gameType === opt.id}
                    onChange={() => {
                      setGameType(opt.id);
                      setPort(opt.defaultPort);
                    }}
                    className="mt-1 text-emerald-500 focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">{opt.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Port */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Puerto TCP Vinculado
            </label>
            <input
              type="number"
              id="new-server-port-input"
              required
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value, 10) || 7777)}
              className="w-full px-3.5 py-2 rounded-lg bg-black/50 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="submit-new-server-btn"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Creando Instancia...' : 'Crear Servidor'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
