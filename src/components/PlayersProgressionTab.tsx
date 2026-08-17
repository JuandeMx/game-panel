import React, { useState } from 'react';
import { 
  Users, 
  UserX, 
  Ban, 
  Heart, 
  Zap, 
  CheckCircle2, 
  Trophy,
  Skull
} from 'lucide-react';
import { PlayerInfo, WorldInfo, ServerStatus } from '../types';

interface PlayersProgressionTabProps {
  players: PlayerInfo[];
  activeWorld: WorldInfo | null;
  serverStatus: ServerStatus;
  onKickPlayer: (name: string, reason: string) => Promise<void>;
  onBanPlayer: (name: string, reason: string) => Promise<void>;
  onSendCommand: (command: string) => void;
}

export const PlayersProgressionTab: React.FC<PlayersProgressionTabProps> = ({
  players,
  activeWorld,
  serverStatus,
  onKickPlayer,
  onBanPlayer,
  onSendCommand,
}) => {
  const [kickModalPlayer, setKickModalPlayer] = useState<string | null>(null);
  const [kickReason, setKickReason] = useState('Incumplimiento de normas del servidor');
  const [actionLoading, setActionLoading] = useState(false);

  const preHardmodeBosses = [
    { name: 'King Slime', level: 'Pre-Hardmode', hp: '2,000 HP', drops: 'Solidifier, Slimy Saddle' },
    { name: 'Eye of Cthulhu', level: 'Pre-Hardmode', hp: '2,800 HP', drops: 'Demonite/Crimtane Ore, Shield of Cthulhu' },
    { name: 'Eater of Worlds', level: 'Pre-Hardmode', hp: '7,500 HP', drops: 'Shadow Scale, Worm Scarf' },
    { name: 'Brain of Cthulhu', level: 'Pre-Hardmode', hp: '1,250 HP', drops: 'Tissue Sample, Brain of Confusion' },
    { name: 'Queen Bee', level: 'Pre-Hardmode', hp: '3,400 HP', drops: 'Beenade, Hive Pack, Honeyed Goggles' },
    { name: 'Skeletron', level: 'Pre-Hardmode', hp: '4,400 HP', drops: 'Bone Glove, Dungeon Access' },
    { name: 'Deerclops', level: 'Pre-Hardmode', hp: '7,000 HP', drops: 'Eyebrella, Radio Thing' },
    { name: 'Wall of Flesh', level: 'Pre-Hardmode (Gateway)', hp: '8,000 HP', drops: 'Pwnhammer, Emblem, Hardmode Unlock' },
  ];

  const hardmodeBosses = [
    { name: 'Queen Slime', level: 'Hardmode', hp: '18,000 HP', drops: 'Gelatinous Pillion, Blade Staff' },
    { name: 'The Twins', level: 'Mecánico', hp: '43,000 HP', drops: 'Soul of Sight, Hallowed Bars' },
    { name: 'The Destroyer', level: 'Mecánico', hp: '80,000 HP', drops: 'Soul of Might, Hallowed Bars' },
    { name: 'Skeletron Prime', level: 'Mecánico', hp: '28,000 HP', drops: 'Soul of Fright, Hallowed Bars' },
    { name: 'Plantera', level: 'Hardmode Jungle', hp: '30,000 HP', drops: 'Temple Key, Seedler, Axe' },
    { name: 'Golem', level: 'Lihzahrd Temple', hp: '39,000 HP', drops: 'Picksaw, Sun Stone, Beetle Scale' },
    { name: 'Duke Fishron', level: 'Ocean Boss', hp: '50,000 HP', drops: 'Fishron Wings, Razorblade Typhoon' },
    { name: 'Empress of Light', level: 'Hallow Boss', hp: '70,000 HP', drops: 'Terraprisma, Soaring Insignia' },
    { name: 'Lunatic Cultist', level: 'Lunar Event', hp: '32,000 HP', drops: 'Ancient Manipulator, Celestial Pillars' },
    { name: 'Moon Lord', level: 'Jefe Final', hp: '145,000 HP', drops: 'Meowmere, Zenith Crafting, Portal Gun' },
  ];

  const handleKickConfirm = async () => {
    if (!kickModalPlayer) return;
    setActionLoading(true);
    try {
      await onKickPlayer(kickModalPlayer, kickReason);
      setKickModalPlayer(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBan = async (playerName: string) => {
    const reason = window.prompt(`Ingresa el motivo del baneo para ${playerName}:`, 'Comportamiento tóxico / Trampas');
    if (!reason) return;
    await onBanPlayer(playerName, reason);
  };

  const isBossDefeated = (name: string) => {
    return activeWorld?.bossesDefeated?.includes(name) || false;
  };

  return (
    <div className="space-y-6">
      
      {/* Live Players Section */}
      <div className="bg-[#111318] border border-white/5 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Jugadores Conectados en Tiempo Real ({players.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Supervisa estadísticas de vida, maná, ping y modera a los usuarios en línea.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Slots: <span className="text-emerald-400 font-bold">{players.length}</span> / {activeWorld ? 16 : '--'}
          </div>
        </div>

        {serverStatus !== 'online' ? (
          <div className="p-8 text-center text-slate-500">
            <Users className="w-8 h-8 mx-auto text-slate-700 mb-2" />
            <p className="text-xs font-medium">El servidor está apagado. Inicia el servidor para ver los jugadores.</p>
          </div>
        ) : players.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Users className="w-8 h-8 mx-auto text-slate-700 mb-2" />
            <p className="text-xs font-medium">No hay jugadores conectados en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <div
                key={player.id}
                className="bg-black/50 border border-white/5 rounded-xl p-4 space-y-3 relative group hover:border-white/10 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-400 uppercase">
                      {player.name.substring(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{player.name}</span>
                        {player.isAdmin && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {player.ip} • {player.ping}ms
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 text-slate-300 border border-white/5">
                    {player.characterClass || 'Aventurero'}
                  </span>
                </div>

                {/* Health & Mana Bars */}
                <div className="space-y-1.5 text-[11px]">
                  {/* Health */}
                  <div>
                    <div className="flex justify-between text-rose-300 mb-0.5">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> Vida
                      </span>
                      <span className="font-mono">{player.health} / {player.maxHealth}</span>
                    </div>
                    <div className="w-full bg-black h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 transition-all"
                        style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Mana */}
                  <div>
                    <div className="flex justify-between text-blue-300 mb-0.5">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-400 fill-blue-400" /> Maná
                      </span>
                      <span className="font-mono">{player.mana} / {player.maxMana}</span>
                    </div>
                    <div className="w-full bg-black h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${(player.mana / (player.maxMana || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1.5">
                  <div className="text-[10px] text-slate-400 font-mono">
                    K/D: {player.kills || 0}/{player.deaths || 0}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      id={`kick-player-btn-${player.name}`}
                      onClick={() => setKickModalPlayer(player.name)}
                      className="px-2 py-1 rounded bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-white/10 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <UserX className="w-3 h-3" />
                      <span>Kick</span>
                    </button>

                    <button
                      id={`ban-player-btn-${player.name}`}
                      onClick={() => handleBan(player.name)}
                      className="px-2 py-1 rounded bg-white/5 hover:bg-rose-600/20 text-slate-300 hover:text-rose-300 border border-white/10 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Ban className="w-3 h-3" />
                      <span>Ban</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Boss & Progression Tracking Section */}
      <div className="bg-[#111318] border border-white/5 rounded-xl p-5 space-y-6">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Registro de Jefes & Progresión del Mundo
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Estado de los jefes míticos derrotados en este mundo. Haz clic en "Invocar / Simular Batalla" para probar eventos.
          </p>
        </div>

        {/* Pre-Hardmode Bosses */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Jefes Pre-Hardmode
            </span>
            <span className="text-[11px] text-slate-500">(Fase Inicial del Mundo)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {preHardmodeBosses.map((boss) => {
              const defeated = isBossDefeated(boss.name);
              return (
                <div
                  key={boss.name}
                  className={`p-3.5 rounded-xl border transition-all ${
                    defeated
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                      : 'bg-black/50 border-white/5 text-slate-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {defeated ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Skull className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      {boss.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{boss.hp}</span>
                  </div>

                  <p className="text-[10px] text-slate-400 line-clamp-1 mb-2.5">
                    Drops: {boss.drops}
                  </p>

                  <button
                    id={`trigger-boss-btn-${boss.name.replace(/\s+/g, '-')}`}
                    disabled={serverStatus !== 'online'}
                    onClick={() => onSendCommand(`boss ${boss.name}`)}
                    className="w-full py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-slate-200 hover:text-white border border-white/10 transition-colors disabled:opacity-40 cursor-pointer text-center"
                  >
                    {defeated ? 'Volver a Invocar' : 'Invocar Batalla'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hardmode Bosses */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Jefes del Modo Difícil (Hardmode)
            </span>
            <span className="text-[11px] text-slate-500">(Fase Avanzada & Evento Lunar)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {hardmodeBosses.map((boss) => {
              const defeated = isBossDefeated(boss.name);
              return (
                <div
                  key={boss.name}
                  className={`p-3.5 rounded-xl border transition-all ${
                    defeated
                      ? 'bg-purple-950/20 border-purple-500/40 text-white'
                      : 'bg-black/50 border-white/5 text-slate-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {defeated ? (
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      ) : (
                        <Skull className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      {boss.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{boss.hp}</span>
                  </div>

                  <p className="text-[10px] text-slate-400 line-clamp-1 mb-2.5">
                    Drops: {boss.drops}
                  </p>

                  <button
                    id={`trigger-boss-hardmode-btn-${boss.name.replace(/\s+/g, '-')}`}
                    disabled={serverStatus !== 'online'}
                    onClick={() => onSendCommand(`boss ${boss.name}`)}
                    className="w-full py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-slate-200 hover:text-white border border-white/10 transition-colors disabled:opacity-40 cursor-pointer text-center"
                  >
                    {defeated ? 'Volver a Invocar' : 'Invocar Batalla'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Kick Modal */}
      {kickModalPlayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserX className="w-5 h-5 text-amber-400" />
              Expulsar a {kickModalPlayer}
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Motivo de la Expulsión
              </label>
              <input
                type="text"
                id="input-kick-reason"
                value={kickReason}
                onChange={(e) => setKickReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setKickModalPlayer(null)}
                className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="confirm-kick-btn"
                disabled={actionLoading}
                onClick={handleKickConfirm}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                {actionLoading ? 'Expulsando...' : 'Confirmar Kick'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
