import React, { useState, useEffect } from 'react';
import { 
  Save, 
  FileCode, 
  Sliders, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Shield, 
  Globe, 
  Server
} from 'lucide-react';
import { TerrariaConfig } from '../types';

interface ConfigTabProps {
  serverId: string;
  config: TerrariaConfig;
  rawConfig: string;
  onSaveConfig: (config: Partial<TerrariaConfig>) => Promise<void>;
  onSaveRawConfig: (content: string) => Promise<void>;
  onReloadConfig: () => Promise<void>;
}

export const ConfigTab: React.FC<ConfigTabProps> = ({
  serverId: _serverId,
  config,
  rawConfig,
  onSaveConfig,
  onSaveRawConfig,
  onReloadConfig,
}) => {
  const [activeMode, setActiveMode] = useState<'visual' | 'raw'>('visual');
  const [formData, setFormData] = useState<TerrariaConfig>(config);
  const [rawText, setRawText] = useState<string>(rawConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  useEffect(() => {
    setRawText(rawConfig);
  }, [rawConfig]);

  const handleInputChange = (field: keyof TerrariaConfig, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveVisual = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await onSaveConfig(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRaw = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await onSaveRawConfig(rawText);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar archivo crudo');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111318] border border-white/5 p-4 rounded-xl">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            Configuración del Servidor (serverconfig.txt)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Personaliza los parámetros de red, mundo, seguridad y reglas de Terraria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher Tabs */}
          <div className="bg-black/60 p-1 rounded-xl border border-white/5 flex items-center">
            <button
              id="mode-visual-btn"
              onClick={() => setActiveMode('visual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeMode === 'visual'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Editor Visual</span>
            </button>

            <button
              id="mode-raw-btn"
              onClick={() => setActiveMode('raw')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeMode === 'raw'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Archivo Crudo</span>
            </button>
          </div>

          {/* Reload Button */}
          <button
            id="reload-config-btn"
            onClick={onReloadConfig}
            title="Recargar configuración desde el servidor"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>¡La configuración ha sido guardada exitosamente en <strong>serverconfig.txt</strong>!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* MODE 1: Visual GUI Editor */}
      {activeMode === 'visual' ? (
        <form onSubmit={handleSaveVisual} className="space-y-6">
          
          {/* Section 1: Red y Acceso */}
          <div className="bg-[#111318] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Server className="w-4 h-4 text-emerald-400" />
              Red y Parámetros de Conexión
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Port */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Puerto del Servidor (port)
                </label>
                <input
                  type="number"
                  id="config-port"
                  value={formData.port || 7777}
                  onChange={(e) => handleInputChange('port', parseInt(e.target.value, 10) || 7777)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Por defecto: 7777 (TCP)</p>
              </div>

              {/* Max Players */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Límite de Jugadores (maxplayers)
                </label>
                <input
                  type="number"
                  id="config-maxplayers"
                  value={formData.maxplayers || 16}
                  onChange={(e) => handleInputChange('maxplayers', parseInt(e.target.value, 10) || 16)}
                  min={1}
                  max={255}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Capacidad máxima simultánea</p>
              </div>

              {/* Server Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Contraseña de Entrada (password)
                </label>
                <input
                  type="text"
                  id="config-password"
                  value={formData.password || ''}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Sin contraseña (público)"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Opcional para restringir acceso</p>
              </div>

            </div>
          </div>

          {/* Section 2: Mundo y Generación */}
          <div className="bg-[#111318] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Globe className="w-4 h-4 text-emerald-400" />
              Mundo y Modos de Dificultad
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* World Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nombre del Mundo (worldname)
                </label>
                <input
                  type="text"
                  id="config-worldname"
                  value={formData.worldname || ''}
                  onChange={(e) => handleInputChange('worldname', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Dificultad del Mundo (difficulty)
                </label>
                <select
                  id="config-difficulty"
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={0}>Clásico (Classic - 0)</option>
                  <option value={1}>Experto (Expert - 1)</option>
                  <option value={2}>Maestro (Master Mode - 2)</option>
                  <option value={3}>Modo Viaje (Journey - 3)</option>
                </select>
              </div>

              {/* World Size (AutoCreate) */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tamaño de Creación (autocreate)
                </label>
                <select
                  id="config-autocreate"
                  value={formData.autocreate}
                  onChange={(e) => handleInputChange('autocreate', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={1}>Pequeño (Small - 1)</option>
                  <option value={2}>Mediano (Medium - 2)</option>
                  <option value={3}>Grande (Large - 3)</option>
                </select>
              </div>

              {/* World Seed */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Semilla de Generación (seed)
                </label>
                <input
                  type="text"
                  id="config-seed"
                  value={formData.seed || ''}
                  onChange={(e) => handleInputChange('seed', e.target.value)}
                  placeholder="Ejemplo: CrimsonMoon2026 o for the worthy"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Idioma del Servidor (language)
                </label>
                <select
                  id="config-language"
                  value={formData.language || 'es-ES'}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="es-ES">Español (es-ES)</option>
                  <option value="en-US">English (en-US)</option>
                  <option value="pt-BR">Português (pt-BR)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Section 3: Servidor & Experiencia */}
          <div className="bg-[#111318] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              Mensaje del Día y Ajustes Avanzados
            </h3>

            <div className="space-y-4">
              
              {/* MOTD */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Mensaje del Día (motd)
                </label>
                <input
                  type="text"
                  id="config-motd"
                  value={formData.motd || ''}
                  onChange={(e) => handleInputChange('motd', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-black/50 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    id="config-secure"
                    checked={formData.secure === 1}
                    onChange={(e) => handleInputChange('secure', e.target.checked ? 1 : 0)}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">Modo Seguro (secure)</div>
                    <div className="text-[10px] text-slate-400">Protección anti-cheat básica</div>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-black/50 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    id="config-upnp"
                    checked={formData.upnp === 1}
                    onChange={(e) => handleInputChange('upnp', e.target.checked ? 1 : 0)}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">Auto-Mapeo UPnP</div>
                    <div className="text-[10px] text-slate-400">Apertura automática de puertos</div>
                  </div>
                </label>

                <div className="p-3 rounded-xl bg-black/50 border border-white/5">
                  <div className="text-xs font-semibold text-white">Tasa de Sincronización NPC</div>
                  <div className="text-[10px] text-slate-400">npcstream: 60 fps</div>
                </div>
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              id="save-config-btn"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar y Aplicar Configuración'}</span>
            </button>
          </div>

        </form>
      ) : (
        /* MODE 2: Raw Text Editor */
        <div className="space-y-4">
          <div className="bg-black border border-white/5 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 text-xs text-slate-400 mb-3">
              <span className="font-mono text-emerald-400 font-semibold">serverconfig.txt</span>
              <span className="text-[11px] text-slate-500">Sintaxis: clave=valor</span>
            </div>

            <textarea
              id="raw-config-textarea"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={16}
              className="w-full bg-transparent font-mono text-xs text-slate-200 focus:outline-none resize-y leading-relaxed"
              spellCheck={false}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveRaw}
              id="save-raw-config-btn"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Archivo Crudo'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
