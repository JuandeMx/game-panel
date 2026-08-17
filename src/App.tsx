import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { NavigationTabs, TabType } from './components/NavigationTabs';
import { OverviewTab } from './components/OverviewTab';
import { ConsoleTab } from './components/ConsoleTab';
import { ConfigTab } from './components/ConfigTab';
import { WorldsBackupsTab } from './components/WorldsBackupsTab';
import { PlayersProgressionTab } from './components/PlayersProgressionTab';
import { ArchitectureTab } from './components/ArchitectureTab';
import { NewServerModal } from './components/NewServerModal';
import { CreateWorldModal } from './components/CreateWorldModal';
import { 
  GameServerInstance, 
  ServerMetrics, 
  LogMessage, 
  WorldInfo, 
  BackupInfo, 
  PlayerInfo, 
  TerrariaConfig,
  GameType
} from './types';

export default function App() {
  const [servers, setServers] = useState<GameServerInstance[]>([]);
  const [activeServerId, setActiveServerId] = useState<string>('terraria-tshock-01');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Real-time server state
  const [metrics, setMetrics] = useState<ServerMetrics>({
    cpu: 0,
    memoryMb: 0,
    maxMemoryMb: 2048,
    uptimeSeconds: 0,
    playersOnline: 0,
    maxPlayers: 16,
    tps: 60,
    pingMs: 15,
  });

  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [worlds, setWorlds] = useState<WorldInfo[]>([]);
  const [activeWorld, setActiveWorld] = useState<WorldInfo | null>(null);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [config, setConfig] = useState<TerrariaConfig>({
    world: 'Aethelgard_Prime.wld',
    port: 7777,
    maxplayers: 16,
    worldname: 'Aethelgard Prime',
    autocreate: 2,
    difficulty: 2,
  });
  const [rawConfig, setRawConfig] = useState<string>('');
  const [autoBackupOnStop, setAutoBackupOnStop] = useState<boolean>(true);

  // Modals & UI States
  const [isNewServerModalOpen, setIsNewServerModalOpen] = useState(false);
  const [isCreateWorldModalOpen, setIsCreateWorldModalOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [powerLoading, setPowerLoading] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  // Fetch servers list
  const fetchServers = useCallback(async () => {
    try {
      const res = await fetch('/api/servers');
      if (res.ok) {
        const data = await res.json();
        setServers(data.servers || []);
      }
    } catch (e) {
      console.error('Error fetching servers:', e);
    }
  }, []);

  // Fetch active server full details
  const fetchActiveServerDetails = useCallback(async (serverId: string) => {
    try {
      const res = await fetch(`/api/servers/${serverId}`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics || metrics);
        setConfig(data.config || config);
        setRawConfig(data.rawConfig || '');
        setActiveWorld(data.activeWorld || null);
        setWorlds(data.worlds || []);
        setBackups(data.backups || []);
        setPlayers(data.players || []);
        setAutoBackupOnStop(data.autoBackupOnStop !== undefined ? data.autoBackupOnStop : true);
      }
    } catch (e) {
      console.error('Error fetching server details:', e);
    }
  }, []);

  // Fetch logs
  const fetchLogs = useCallback(async (serverId: string) => {
    try {
      const res = await fetch(`/api/servers/${serverId}/logs?limit=150`);
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          setLogs(data.logs);
        }
      }
    } catch (e) {
      console.error('Error fetching logs:', e);
    }
  }, []);

  // Setup WebSocket connection
  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  useEffect(() => {
    fetchActiveServerDetails(activeServerId);
    fetchLogs(activeServerId);

    // Setup or reconnect WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      // Subscribe to active server events
      ws.send(JSON.stringify({ type: 'subscribe', serverId: activeServerId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.serverId && data.serverId !== activeServerId) return;

        if (data.type === 'log' && data.log) {
          setLogs((prev) => [...prev, data.log].slice(-1000));
        } else if (data.type === 'metrics' && data.metrics) {
          setMetrics(data.metrics);
        } else if (data.type === 'status_change') {
          setServers((prev) =>
            prev.map((s) => (s.id === data.serverId ? { ...s, status: data.status } : s))
          );
          fetchActiveServerDetails(activeServerId);
        } else if (data.type === 'initial_state') {
          if (data.logs) setLogs(data.logs);
          if (data.metrics) setMetrics(data.metrics);
          if (data.activeWorld) setActiveWorld(data.activeWorld);
          if (data.players) setPlayers(data.players);
        }
      } catch (err) {
        console.error('Error in WS handler:', err);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [activeServerId, fetchActiveServerDetails, fetchLogs]);

  const activeServer = servers.find((s) => s.id === activeServerId) || servers[0] || null;

  // Power actions handler
  const handlePowerAction = async (action: 'start' | 'stop' | 'restart' | 'force_kill') => {
    if (!activeServerId) return;
    setPowerLoading(true);
    try {
      const res = await fetch(`/api/servers/${activeServerId}/power`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      await fetchServers();
      await fetchActiveServerDetails(activeServerId);
    } catch (e) {
      console.error('Power action error:', e);
    } finally {
      setPowerLoading(false);
    }
  };

  // Send Command handler
  const handleSendCommand = async (command: string) => {
    if (!activeServerId || !command.trim()) return;

    // Send via WebSocket if ready, otherwise REST API
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'command', serverId: activeServerId, command }));
    } else {
      await fetch(`/api/servers/${activeServerId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
    }

    // Refresh details if command modifies state
    setTimeout(() => {
      fetchActiveServerDetails(activeServerId);
    }, 500);
  };

  // Config handlers
  const handleSaveConfig = async (newConfig: Partial<TerrariaConfig>) => {
    const res = await fetch(`/api/servers/${activeServerId}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    });
    if (!res.ok) throw new Error('Error al guardar configuración');
    await fetchActiveServerDetails(activeServerId);
  };

  const handleSaveRawConfig = async (content: string) => {
    const res = await fetch(`/api/servers/${activeServerId}/config/raw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Error al guardar archivo crudo');
    await fetchActiveServerDetails(activeServerId);
  };

  // Worlds & Backups handlers
  const handleSelectWorld = async (filename: string) => {
    const res = await fetch(`/api/servers/${activeServerId}/worlds/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename }),
    });
    if (!res.ok) throw new Error('Error seleccionando mundo');
    await fetchActiveServerDetails(activeServerId);
  };

  const handleCreateWorld = async (worldData: {
    name: string;
    size: 'Small' | 'Medium' | 'Large';
    difficulty: 'Classic' | 'Expert' | 'Master' | 'Journey';
    seed?: string;
  }) => {
    const res = await fetch(`/api/servers/${activeServerId}/worlds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(worldData),
    });
    if (!res.ok) throw new Error('Error creando mundo');
    await fetchActiveServerDetails(activeServerId);
  };

  const handleCreateBackup = async (worldName?: string) => {
    const res = await fetch(`/api/servers/${activeServerId}/backups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ worldName, trigger: 'manual' }),
    });
    if (!res.ok) throw new Error('Error creando respaldo');
    await fetchActiveServerDetails(activeServerId);
  };

  const handleRestoreBackup = async (backupId: string) => {
    const res = await fetch(`/api/servers/${activeServerId}/backups/${backupId}/restore`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Error al restaurar respaldo');
    await fetchActiveServerDetails(activeServerId);
  };

  const handleDeleteBackup = async (backupId: string) => {
    const res = await fetch(`/api/servers/${activeServerId}/backups/${backupId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar respaldo');
    await fetchActiveServerDetails(activeServerId);
  };

  const handleToggleAutoBackup = async (enabled: boolean) => {
    const res = await fetch(`/api/servers/${activeServerId}/autobackup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    if (res.ok) {
      setAutoBackupOnStop(enabled);
    }
  };

  // Player Moderation handlers
  const handleKickPlayer = async (playerName: string, reason: string) => {
    await fetch(`/api/servers/${activeServerId}/players/${encodeURIComponent(playerName)}/kick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    await fetchActiveServerDetails(activeServerId);
  };

  const handleBanPlayer = async (playerName: string, reason: string) => {
    await fetch(`/api/servers/${activeServerId}/players/${encodeURIComponent(playerName)}/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    await fetchActiveServerDetails(activeServerId);
  };

  // Create new server handler
  const handleCreateServer = async (serverData: { name: string; gameType: GameType; port: number }) => {
    const res = await fetch('/api/servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serverData),
    });
    if (res.ok) {
      const data = await res.json();
      await fetchServers();
      if (data.server?.id) {
        setActiveServerId(data.server.id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0c] text-slate-300 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Top Navbar */}
      <Navbar
        servers={servers}
        activeServer={activeServer}
        onSelectServer={(id) => setActiveServerId(id)}
        onPowerAction={handlePowerAction}
        onOpenNewServerModal={() => setIsNewServerModalOpen(true)}
        wsConnected={wsConnected}
        powerLoading={powerLoading}
      />

      {/* Navigation Sub-header Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        playerCount={metrics.playersOnline}
        worldName={activeWorld?.name}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && activeServer && (
          <OverviewTab
            server={activeServer}
            metrics={metrics}
            activeWorld={activeWorld}
            onSendCommand={handleSendCommand}
            onPowerAction={handlePowerAction}
          />
        )}

        {activeTab === 'console' && activeServer && (
          <ConsoleTab
            logs={logs}
            serverStatus={activeServer.status}
            onSendCommand={handleSendCommand}
            onClearLogs={() => setLogs([])}
          />
        )}

        {activeTab === 'config' && (
          <ConfigTab
            serverId={activeServerId}
            config={config}
            rawConfig={rawConfig}
            onSaveConfig={handleSaveConfig}
            onSaveRawConfig={handleSaveRawConfig}
            onReloadConfig={() => fetchActiveServerDetails(activeServerId)}
          />
        )}

        {activeTab === 'worlds' && activeServer && (
          <WorldsBackupsTab
            worlds={worlds}
            activeWorld={activeWorld}
            backups={backups}
            serverStatus={activeServer.status}
            autoBackupOnStop={autoBackupOnStop}
            onSelectWorld={handleSelectWorld}
            onOpenCreateWorldModal={() => setIsCreateWorldModalOpen(true)}
            onCreateBackup={handleCreateBackup}
            onRestoreBackup={handleRestoreBackup}
            onDeleteBackup={handleDeleteBackup}
            onToggleAutoBackup={handleToggleAutoBackup}
          />
        )}

        {activeTab === 'players' && activeServer && (
          <PlayersProgressionTab
            players={players}
            activeWorld={activeWorld}
            serverStatus={activeServer.status}
            onKickPlayer={handleKickPlayer}
            onBanPlayer={handleBanPlayer}
            onSendCommand={handleSendCommand}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureTab />
        )}
      </main>

      {/* Modals */}
      <NewServerModal
        isOpen={isNewServerModalOpen}
        onClose={() => setIsNewServerModalOpen(false)}
        onCreateServer={handleCreateServer}
      />

      <CreateWorldModal
        isOpen={isCreateWorldModalOpen}
        onClose={() => setIsCreateWorldModalOpen(false)}
        onCreateWorld={handleCreateWorld}
      />

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0b0d11] py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-tight">Nexus GameOps</span>
            <span>•</span>
            <span className="text-slate-400">Terraria & Multi-Game Server Controller</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              WebSocket: <span className={wsConnected ? 'text-emerald-400' : 'text-rose-400'}>{wsConnected ? 'Conectado (/ws)' : 'Reconectando...'}</span>
            </span>
            <span>•</span>
            <span className="text-slate-400">REST API v1</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
