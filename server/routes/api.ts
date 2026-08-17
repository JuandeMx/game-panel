import { Router, Request, Response } from 'express';
import { ProcessManager } from '../services/ProcessManager';

const router = Router();
const processManager = ProcessManager.getInstance();

// Middleware to find target adapter
const getAdapterOr404 = (req: Request, res: Response) => {
  const { id } = req.params;
  const adapter = processManager.getAdapter(id);
  if (!adapter) {
    res.status(404).json({ error: `Servidor con ID '${id}' no encontrado.` });
    return null;
  }
  return adapter;
};

// 1. List all servers
router.get('/servers', (req: Request, res: Response) => {
  res.json({ servers: processManager.getAllServers() });
});

// 2. Create new server instance
router.post('/servers', (req: Request, res: Response) => {
  const { name, gameType, port } = req.body;
  if (!name || !gameType || !port) {
    return res.status(400).json({ error: 'Faltan campos requeridos: name, gameType, port' });
  }
  const adapter = processManager.createServer({ name, gameType, port: parseInt(port, 10) });
  res.status(201).json({
    message: 'Servidor creado exitosamente',
    server: {
      id: adapter.id,
      name: adapter.name,
      gameType: adapter.gameType,
      status: adapter.getStatus(),
      port: adapter.port,
    }
  });
});

// 3. Get single server status & details
router.get('/servers/:id', (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  res.json({
    id: adapter.id,
    name: adapter.name,
    gameType: adapter.gameType,
    gameTitle: adapter.gameTitle,
    version: adapter.version,
    status: adapter.getStatus(),
    port: adapter.port,
    host: adapter.host,
    metrics: adapter.getMetrics(),
    config: adapter.getConfig(),
    rawConfig: adapter.getRawConfigFile(),
    activeWorld: adapter.getActiveWorld(),
    worlds: adapter.getWorlds(),
    backups: adapter.getBackups(),
    players: adapter.getPlayers(),
    autoBackupOnStop: adapter.isAutoBackupOnStopEnabled(),
  });
});

// 4. Power controls (start, stop, restart, force_kill)
router.post('/servers/:id/power', async (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  const { action, graceful = true } = req.body;
  let result;

  switch (action) {
    case 'start':
      result = await adapter.start();
      break;
    case 'stop':
      result = await adapter.stop(graceful);
      break;
    case 'restart':
      result = await adapter.restart();
      break;
    case 'force_kill':
      result = await adapter.forceKill();
      break;
    default:
      return res.status(400).json({ error: `Acción de energía '${action}' no reconocida. Use: start, stop, restart, force_kill` });
  }

  res.json(result);
});

// 5. Send command to stdin / console
router.post('/servers/:id/command', async (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'El campo "command" es obligatorio.' });
  }

  const result = await adapter.sendCommand(command);
  res.json(result);
});

// 6. Get logs
router.get('/servers/:id/logs', (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 200;
  res.json({ logs: adapter.getLogs(limit) });
});

// 7. Get / Save server configuration
router.get('/servers/:id/config', (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  res.json({
    config: adapter.getConfig(),
    raw: adapter.getRawConfigFile(),
  });
});

router.post('/servers/:id/config', async (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  const result = await adapter.saveConfig(req.body);
  res.json(result);
});

router.post('/servers/:id/config/raw', async (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  const { content } = req.body;
  if (content === undefined) {
    return res.status(400).json({ error: 'Falta el contenido en texto plano.' });
  }

  const result = await adapter.saveRawConfigFile(content);
  res.json(result);
});

// 8. World Management
router.get('/servers/:id/worlds', (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  res.json({
    worlds: adapter.getWorlds(),
    activeWorld: adapter.getActiveWorld(),
  });
});

router.post('/servers/:id/worlds', async (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  const { name, size, difficulty, seed } = req.body;
  if (!name || !size || !difficulty) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos para crear el mundo (name, size, difficulty).' });
  }

  const result = await adapter.createWorld({ name, size, difficulty, seed });
  res.json(result);
});

router.post('/servers/:id/worlds/select', async (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  const { filename } = req.body;
  if (!filename) {
    return res.status(400).json({ error: 'Falta filename del mundo.' });
  }

  const result = await adapter.selectWorld(filename);
  res.json(result);
});

// 9. Backups Management
router.get('/servers/:id/backups', (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  res.json({ backups: adapter.getBackups() });
});

router.post('/servers/:id/backups', async (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  const { worldName, trigger = 'manual' } = req.body;
  const result = await adapter.createBackup(worldName, trigger);
  res.json(result);
});

router.post('/servers/:id/backups/:backupId/restore', async (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  const { backupId } = req.params;
  const result = await adapter.restoreBackup(backupId);
  res.json(result);
});

router.delete('/servers/:id/backups/:backupId', async (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  const { backupId } = req.params;
  const result = await adapter.deleteBackup(backupId);
  res.json(result);
});

// 10. Player moderation
router.get('/servers/:id/players', (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  res.json({ players: adapter.getPlayers() });
});

router.post('/servers/:id/players/:playerName/kick', async (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  const { playerName } = req.params;
  const { reason } = req.body;
  const result = await adapter.kickPlayer(playerName, reason);
  res.json(result);
});

router.post('/servers/:id/players/:playerName/ban', async (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  const { playerName } = req.params;
  const { reason } = req.body;
  const result = await adapter.banPlayer(playerName, reason);
  res.json(result);
});

// 11. Auto-backup toggle
router.post('/servers/:id/autobackup', (req: Request, res: Response) => {
  const adapter = getAdapterOr404(req, res);
  if (!adapter) return;

  const { enabled } = req.body;
  adapter.setAutoBackupOnStop(Boolean(enabled));
  res.json({ success: true, autoBackupOnStop: adapter.isAutoBackupOnStopEnabled() });
});

export default router;
