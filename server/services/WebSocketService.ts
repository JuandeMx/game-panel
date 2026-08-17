import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { ProcessManager } from './ProcessManager';

export class WebSocketService {
  private wss: WebSocketServer;
  private processManager: ProcessManager;
  private clientSubscriptions: Map<WebSocket, string> = new Map(); // ws -> serverId

  constructor(server: HttpServer) {
    this.processManager = ProcessManager.getInstance();
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocketServer();
    this.attachAdapterListeners();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      // Default subscribe to terraria-tshock-01
      this.clientSubscriptions.set(ws, 'terraria-tshock-01');

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === 'subscribe') {
            const serverId = data.serverId;
            this.clientSubscriptions.set(ws, serverId);
            const adapter = this.processManager.getAdapter(serverId);
            if (adapter) {
              // Send initial state & recent logs
              ws.send(JSON.stringify({
                type: 'initial_state',
                serverId,
                status: adapter.getStatus(),
                metrics: adapter.getMetrics(),
                logs: adapter.getLogs(100),
                activeWorld: adapter.getActiveWorld(),
                players: adapter.getPlayers(),
              }));
            }
          } else if (data.type === 'command') {
            const serverId = this.clientSubscriptions.get(ws) || data.serverId;
            const adapter = this.processManager.getAdapter(serverId);
            if (adapter && data.command) {
              adapter.sendCommand(data.command);
            }
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      });

      ws.on('close', () => {
        this.clientSubscriptions.delete(ws);
      });

      // Send initial data for default server
      const defaultAdapter = this.processManager.getAdapter('terraria-tshock-01');
      if (defaultAdapter) {
        ws.send(JSON.stringify({
          type: 'initial_state',
          serverId: 'terraria-tshock-01',
          status: defaultAdapter.getStatus(),
          metrics: defaultAdapter.getMetrics(),
          logs: defaultAdapter.getLogs(100),
          activeWorld: defaultAdapter.getActiveWorld(),
          players: defaultAdapter.getPlayers(),
        }));
      }
    });
  }

  private attachAdapterListeners() {
    const servers = this.processManager.getAllServers();
    servers.forEach(srv => {
      const adapter = this.processManager.getAdapter(srv.id);
      if (!adapter) return;

      adapter.on('log', (log) => {
        this.broadcastToServerSubscribers(adapter.id, {
          type: 'log',
          serverId: adapter.id,
          log,
        });
      });

      adapter.on('statusChange', (data) => {
        this.broadcastToServerSubscribers(adapter.id, {
          type: 'status_change',
          serverId: adapter.id,
          status: data.status,
          oldStatus: data.oldStatus,
        });
      });

      adapter.on('metrics', (metrics) => {
        this.broadcastToServerSubscribers(adapter.id, {
          type: 'metrics',
          serverId: adapter.id,
          metrics,
        });
      });
    });
  }

  private broadcastToServerSubscribers(serverId: string, payload: any) {
    const msg = JSON.stringify(payload);
    this.clientSubscriptions.forEach((subServerId, client) => {
      if (subServerId === serverId && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }
}
