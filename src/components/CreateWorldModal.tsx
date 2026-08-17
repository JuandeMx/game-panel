import React, { useState } from 'react';
import { Globe2, X, Plus, Sparkles } from 'lucide-react';

interface CreateWorldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorld: (worldData: {
    name: string;
    size: 'Small' | 'Medium' | 'Large';
    difficulty: 'Classic' | 'Expert' | 'Master' | 'Journey';
    seed?: string;
  }) => Promise<void>;
}

export const CreateWorldModal: React.FC<CreateWorldModalProps> = ({
  isOpen,
  onClose,
  onCreateWorld,
}) => {
  const [name, setName] = useState('Nuevo Reino');
  const [size, setSize] = useState<'Small' | 'Medium' | 'Large'>('Medium');
  const [difficulty, setDifficulty] = useState<'Classic' | 'Expert' | 'Master' | 'Journey'>('Master');
  const [seed, setSeed] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onCreateWorld({ name, size, difficulty, seed: seed.trim() || undefined });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const generateRandomSeed = () => {
    const seeds = ['CrimsonMoon2026', 'ForTheWorthy', 'DrunkWorld0516', 'NotTheBees', 'ZenithSeed', 'AethelgardLegend'];
    setSeed(seeds[Math.floor(Math.random() * seeds.length)]);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111318] border border-white/10 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generar Nuevo Mundo de Terraria (.wld)</h3>
              <p className="text-xs text-slate-400">Crea un nuevo mapa con biomas y parámetros personalizados.</p>
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
          
          {/* World Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Nombre del Mundo
            </label>
            <input
              type="text"
              id="new-world-name-input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Valhalla Prime"
              className="w-full px-3.5 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* World Size */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Tamaño del Mapa
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['Small', 'Medium', 'Large'] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSize(s)}
                  className={`p-3 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                    size === s
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                      : 'bg-black/50 border-white/5 text-slate-400 hover:border-white/10'
                  }`}
                >
                  <div>{s === 'Small' ? 'Pequeño' : s === 'Medium' ? 'Mediano' : 'Grande'}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {s === 'Small' ? '12.5 MB' : s === 'Medium' ? '25 MB' : '50 MB'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Dificultad
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Classic', 'Expert', 'Master', 'Journey'] as const).map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                    difficulty === d
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                      : 'bg-black/50 border-white/5 text-slate-400 hover:border-white/10'
                  }`}
                >
                  {d === 'Classic' ? 'Clásico' : d === 'Expert' ? 'Experto' : d === 'Master' ? 'Maestro' : 'Viaje'}
                </button>
              ))}
            </div>
          </div>

          {/* Seed */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Semilla (Seed) Opcional
              </label>
              <button
                type="button"
                onClick={generateRandomSeed}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Sparkles className="w-3 h-3" />
                Semilla Aleatoria
              </button>
            </div>
            <input
              type="text"
              id="new-world-seed-input"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Deja en blanco para semilla aleatoria"
              className="w-full px-3.5 py-2 rounded-lg bg-black/50 border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit */}
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
              id="submit-create-world-btn"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Generando Mapa...' : 'Crear Mundo'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
