import React, { useState } from 'react';
import { 
  Globe2, 
  Archive, 
  Plus, 
  RotateCcw, 
  Trash2, 
  Check, 
  AlertTriangle, 
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { WorldInfo, BackupInfo, ServerStatus } from '../types';

interface WorldsBackupsTabProps {
  worlds: WorldInfo[];
  activeWorld: WorldInfo | null;
  backups: BackupInfo[];
  serverStatus: ServerStatus;
  autoBackupOnStop: boolean;
  onSelectWorld: (filename: string) => Promise<void>;
  onOpenCreateWorldModal: () => void;
  onCreateBackup: (worldName?: string) => Promise<void>;
  onRestoreBackup: (backupId: string) => Promise<void>;
  onDeleteBackup: (backupId: string) => Promise<void>;
  onToggleAutoBackup: (enabled: boolean) => Promise<void>;
}

export const WorldsBackupsTab: React.FC<WorldsBackupsTabProps> = ({
  worlds,
  activeWorld,
  backups,
  serverStatus,
  autoBackupOnStop,
  onSelectWorld,
  onOpenCreateWorldModal,
  onCreateBackup,
  onRestoreBackup,
  onDeleteBackup,
  onToggleAutoBackup,
}) => {
  const [activeSubSection, setActiveSubSection] = useState<'worlds' | 'backups'>('worlds');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleSelectWorld = async (filename: string) => {
    setLoadingAction(`select-${filename}`);
    try {
      await onSelectWorld(filename);
      showFeedback('success', `Mundo '${filename}' establecido como activo.`);
    } catch (e: any) {
      showFeedback('error', e.message || 'Error seleccionando mundo');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCreateBackup = async () => {
    setLoadingAction('create-backup');
    try {
      await onCreateBackup(activeWorld?.name);
      showFeedback('success', '¡Respaldo generado y comprimido exitosamente!');
    } catch (e: any) {
      showFeedback('error', e.message || 'Error creando respaldo');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRestoreBackup = async (backup: BackupInfo) => {
    if (serverStatus === 'online') {
      showFeedback('error', 'Debes apagar el servidor antes de restaurar un respaldo de mundo.');
      return;
    }
    const confirmed = window.confirm(`¿Estás seguro de restaurar el respaldo '${backup.name}' sobre '${backup.worldName}'?`);
    if (!confirmed) return;

    setLoadingAction(`restore-${backup.id}`);
    try {
      await onRestoreBackup(backup.id);
      showFeedback('success', `Respaldo '${backup.name}' restaurado con éxito.`);
    } catch (e: any) {
      showFeedback('error', e.message || 'Error al restaurar respaldo');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    setLoadingAction(`delete-${backupId}`);
    try {
      await onDeleteBackup(backupId);
      showFeedback('success', 'Archivo de respaldo eliminado.');
    } catch (e: any) {
      showFeedback('error', e.message || 'Error al eliminar respaldo');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-Tabs Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111318] border border-white/5 p-4 rounded-xl">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-emerald-400" />
            Gestión de Mundos (.wld) y Respaldos (.zip)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Administra tus mundos de Terraria, genera respaldos automáticos antes de apagar y restaura partidas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-black/60 p-1 rounded-xl border border-white/5 flex items-center">
            <button
              id="subtab-worlds-btn"
              onClick={() => setActiveSubSection('worlds')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSubSection === 'worlds'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Mundos ({worlds.length})</span>
            </button>

            <button
              id="subtab-backups-btn"
              onClick={() => setActiveSubSection('backups')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSubSection === 'backups'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Respaldos ({backups.length})</span>
            </button>
          </div>

          {activeSubSection === 'worlds' ? (
            <button
              id="open-create-world-modal-btn"
              onClick={onOpenCreateWorldModal}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Nuevo Mundo</span>
            </button>
          ) : (
            <button
              id="create-backup-now-btn"
              disabled={loadingAction === 'create-backup'}
              onClick={handleCreateBackup}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{loadingAction === 'create-backup' ? 'Generando...' : 'Crear Respaldo Ahora'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback banner */}
      {feedbackMsg && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {feedbackMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* SUBSECTION 1: Worlds Manager */}
      {activeSubSection === 'worlds' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {worlds.map((world) => {
              const isActive = activeWorld?.filename === world.filename || activeWorld?.name === world.name;
              return (
                <div
                  key={world.filename}
                  className={`bg-[#111318] rounded-xl p-5 border transition-all relative flex flex-col justify-between ${
                    isActive
                      ? 'border-emerald-500/50 bg-[#111318] shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30'
                      : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white truncate max-w-[170px]" title={world.name}>
                            {world.name}
                          </h3>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">{world.filename}</p>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono ${
                        world.difficulty === 'Master' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        world.difficulty === 'Expert' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {world.difficulty}
                      </span>
                    </div>

                    {/* Stats List */}
                    <div className="space-y-1.5 text-xs text-slate-300 border-t border-white/5 pt-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tamaño del Mapa:</span>
                        <span className="font-medium text-slate-200">{world.size} ({world.sizeMb} MB)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Modo Hardmode:</span>
                        <span className={`font-semibold ${world.hardmode ? 'text-purple-400' : 'text-slate-400'}`}>
                          {world.hardmode ? '🔥 Activo' : '🌱 Pre-Hardmode'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Semilla:</span>
                        <span className="font-mono text-slate-300 truncate max-w-[130px]" title={world.seed}>
                          {world.seed || 'Random'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Último Guardado:</span>
                        <span className="text-slate-400">{world.lastSavedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    {isActive ? (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Mundo en ejecución
                      </span>
                    ) : (
                      <button
                        id={`select-world-btn-${world.filename}`}
                        disabled={loadingAction === `select-${world.filename}`}
                        onClick={() => handleSelectWorld(world.filename)}
                        className="w-full py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer text-center border border-white/10"
                      >
                        {loadingAction === `select-${world.filename}` ? 'Cambiando...' : 'Cargar este Mundo'}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBSECTION 2: Backups Manager */}
      {activeSubSection === 'backups' && (
        <div className="space-y-4">
          
          {/* Auto-Backup Banner Switch */}
          <div className="bg-[#111318] border border-white/5 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Respaldo Automático al Apagar el Servidor</h4>
                <p className="text-[11px] text-slate-400">
                  Crea automáticamente un archivo .zip comprimido del mundo activo antes de que el proceso termine de forma segura.
                </p>
              </div>
            </div>

            <button
              id="toggle-autobackup-btn"
              onClick={() => onToggleAutoBackup(!autoBackupOnStop)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                autoBackupOnStop
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              {autoBackupOnStop ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
              <span>{autoBackupOnStop ? 'Auto-Respaldo Activado' : 'Desactivado'}</span>
            </button>
          </div>

          {/* Backups List Table */}
          <div className="bg-[#111318] border border-white/5 rounded-xl overflow-hidden shadow-sm">
            {backups.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Archive className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                <p className="text-sm font-semibold text-slate-400">No hay archivos de respaldo aún</p>
                <p className="text-xs text-slate-500 mt-1">Haz clic en "Crear Respaldo Ahora" para salvaguardar tu mundo.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-black/50 text-slate-400 uppercase text-[10px] font-semibold border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3">Nombre del Archivo</th>
                      <th className="px-4 py-3">Mundo de Origen</th>
                      <th className="px-4 py-3">Disparador</th>
                      <th className="px-4 py-3">Tamaño</th>
                      <th className="px-4 py-3">Fecha de Creación</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {backups.map((bak) => (
                      <tr key={bak.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-emerald-300 font-medium">
                          {bak.name}
                        </td>
                        <td className="px-4 py-3.5 text-white font-semibold">
                          {bak.worldName}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            bak.trigger === 'auto_shutdown'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : bak.trigger === 'scheduled'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {bak.trigger === 'auto_shutdown' ? 'Auto-Apagado' : bak.trigger === 'scheduled' ? 'Programado' : 'Manual'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-300">
                          {bak.sizeMb} MB
                        </td>
                        <td className="px-4 py-3.5 text-slate-400">
                          {bak.timestamp}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`restore-backup-btn-${bak.id}`}
                              disabled={loadingAction === `restore-${bak.id}`}
                              onClick={() => handleRestoreBackup(bak)}
                              title="Restaurar este respaldo (Requiere servidor apagado)"
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                              <span>Restaurar</span>
                            </button>

                            <button
                              id={`delete-backup-btn-${bak.id}`}
                              disabled={loadingAction === `delete-${bak.id}`}
                              onClick={() => handleDeleteBackup(bak.id)}
                              title="Eliminar archivo de respaldo"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
