import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
  requestId?: string;
}

export interface WebSocketClient {
  id: string;
  ws: WebSocket;
  isAlive: boolean;
  subscriptions: Set<string>;
  metadata: {
    ip: string;
    userAgent: string;
    connectedAt: string;
  };
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private heartbeatInterval?: NodeJS.Timeout;
  private messageHandlers: Map<string, (client: WebSocketClient, data: any) => void> = new Map();

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.setupHeartbeat();
    this.setupMessageHandlers();
  }

  private setupHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          logger.info(`Removing dead WebSocket client: ${clientId}`);
          this.removeClient(clientId);
          return;
        }
        client.isAlive = false;
        client.ws.ping();
      });
    }, config.websocket.heartbeatInterval);
  }

  private setupMessageHandlers(): void {
    // 订阅频道
    this.messageHandlers.set('subscribe', (client, data) => {
      const { channels } = data;
      if (Array.isArray(channels)) {
        channels.forEach(channel => {
          if (typeof channel === 'string') {
            client.subscriptions.add(channel);
            logger.debug(`Client ${client.id} subscribed to channel: ${channel}`);
          }
        });
      }
    });

    // 取消订阅频道
    this.messageHandlers.set('unsubscribe', (client, data) => {
      const { channels } = data;
      if (Array.isArray(channels)) {
        channels.forEach(channel => {
          if (typeof channel === 'string') {
            client.subscriptions.delete(channel);
            logger.debug(`Client ${client.id} unsubscribed from channel: ${channel}`);
          }
        });
      }
    });

    // 心跳响应
    this.messageHandlers.set('pong', (client) => {
      client.isAlive = true;
    });

    // 获取客户端信息
    this.messageHandlers.set('getInfo', (client) => {
      this.sendToClient(client.id, {
        type: 'clientInfo',
        data: {
          id: client.id,
          subscriptions: Array.from(client.subscriptions),
          metadata: client.metadata,
        },
      });
    });
  }

  public handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const clientId = this.generateClientId();
    const client: WebSocketClient = {
      id: clientId,
      ws,
      isAlive: true,
      subscriptions: new Set(),
      metadata: {
        ip: req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        connectedAt: new Date().toISOString(),
      },
    };

    // 检查连接数限制
    if (this.clients.size >= config.websocket.maxConnections) {
      logger.warn(`WebSocket connection limit reached, rejecting client: ${clientId}`);
      ws.close(1013, 'Server overloaded');
      return;
    }

    this.clients.set(clientId, client);
    logger.info(`WebSocket client connected: ${clientId}`, {
      ip: client.metadata.ip,
      userAgent: client.metadata.userAgent,
      totalClients: this.clients.size,
    });

    // 发送欢迎消息
    this.sendToClient(clientId, {
      type: 'welcome',
      data: {
        clientId,
        serverTime: new Date().toISOString(),
      },
    });

    // 设置消息处理
    ws.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(client, message);
      } catch (error) {
        logger.error(`Invalid WebSocket message from client ${clientId}:`, error);
        this.sendToClient(clientId, {
          type: 'error',
          data: {
            message: 'Invalid message format',
          },
        });
      }
    });

    // 设置pong处理
    ws.on('pong', () => {
      client.isAlive = true;
    });

    // 设置关闭处理
    ws.on('close', (code: number, reason: Buffer) => {
      logger.info(`WebSocket client disconnected: ${clientId}`, {
        code,
        reason: reason.toString(),
        duration: Date.now() - new Date(client.metadata.connectedAt).getTime(),
      });
      this.removeClient(clientId);
    });

    // 设置错误处理
    ws.on('error', (error: Error) => {
      logger.error(`WebSocket client error: ${clientId}`, error);
      this.removeClient(clientId);
    });
  }

  private handleMessage(client: WebSocketClient, message: WebSocketMessage): void {
    const { type, data } = message;
    
    logger.debug(`Received WebSocket message from ${client.id}:`, { type, data });

    const handler = this.messageHandlers.get(type);
    if (handler) {
      try {
        handler(client, data);
      } catch (error) {
        logger.error(`Error handling WebSocket message type '${type}':`, error);
        this.sendToClient(client.id, {
          type: 'error',
          data: {
            message: `Error handling message type '${type}'`,
          },
        });
      }
    } else {
      logger.warn(`Unknown WebSocket message type: ${type}`);
      this.sendToClient(client.id, {
        type: 'error',
        data: {
          message: `Unknown message type: ${type}`,
        },
      });
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.ws.terminate();
      this.clients.delete(clientId);
      logger.debug(`Removed WebSocket client: ${clientId}`);
    }
  }

  // 发送消息给特定客户端
  public sendToClient(clientId: string, message: WebSocketMessage): boolean {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      const messageWithTimestamp = {
        ...message,
        timestamp: new Date().toISOString(),
      };
      client.ws.send(JSON.stringify(messageWithTimestamp));
      return true;
    } catch (error) {
      logger.error(`Failed to send message to client ${clientId}:`, error);
      this.removeClient(clientId);
      return false;
    }
  }

  // 广播消息给所有客户端
  public broadcast(message: WebSocketMessage): number {
    let sentCount = 0;
    this.clients.forEach((_, clientId) => {
      if (this.sendToClient(clientId, message)) {
        sentCount++;
      }
    });
    return sentCount;
  }

  // 发送消息给订阅了特定频道的客户端
  public broadcastToChannel(channel: string, message: WebSocketMessage): number {
    let sentCount = 0;
    this.clients.forEach((client, clientId) => {
      if (client.subscriptions.has(channel)) {
        if (this.sendToClient(clientId, message)) {
          sentCount++;
        }
      }
    });
    return sentCount;
  }

  // 发送项目日志
  public sendProjectLog(projectId: string, log: any): void {
    this.broadcastToChannel(`project:${projectId}:logs`, {
      type: 'projectLog',
      data: {
        projectId,
        log,
      },
    });
  }

  // 发送项目状态更新
  public sendProjectStatus(projectId: string, status: any): void {
    this.broadcastToChannel(`project:${projectId}:status`, {
      type: 'projectStatus',
      data: {
        projectId,
        status,
      },
    });
  }

  // 发送构建进度
  public sendBuildProgress(projectId: string, progress: any): void {
    this.broadcastToChannel(`project:${projectId}:build`, {
      type: 'buildProgress',
      data: {
        projectId,
        progress,
      },
    });
  }

  // 发送部署进度
  public sendDeployProgress(projectId: string, progress: any): void {
    this.broadcastToChannel(`project:${projectId}:deploy`, {
      type: 'deployProgress',
      data: {
        projectId,
        progress,
      },
    });
  }

  // 发送Git状态更新
  public sendGitStatus(projectId: string, status: any): void {
    this.broadcastToChannel(`project:${projectId}:git`, {
      type: 'gitStatus',
      data: {
        projectId,
        status,
      },
    });
  }

  // 发送系统通知
  public sendSystemNotification(notification: any): void {
    this.broadcast({
      type: 'systemNotification',
      data: notification,
    });
  }

  // 获取客户端统计信息
  public getStats(): any {
    const stats = {
      totalClients: this.clients.size,
      clientsByChannel: new Map<string, number>(),
      clientsByIp: new Map<string, number>(),
    };

    this.clients.forEach((client, clientId) => {
      // 统计频道订阅
      client.subscriptions.forEach(channel => {
        const count = stats.clientsByChannel.get(channel) || 0;
        stats.clientsByChannel.set(channel, count + 1);
      });

      // 统计IP分布
      const ip = client.metadata.ip;
      const count = stats.clientsByIp.get(ip) || 0;
      stats.clientsByIp.set(ip, count + 1);
    });

    return {
      ...stats,
      clientsByChannel: Object.fromEntries(stats.clientsByChannel),
      clientsByIp: Object.fromEntries(stats.clientsByIp),
    };
  }

  // 获取所有客户端信息
  public getClients(): any[] {
    return Array.from(this.clients.values()).map(client => ({
      id: client.id,
      subscriptions: Array.from(client.subscriptions),
      metadata: client.metadata,
      isAlive: client.isAlive,
    }));
  }

  // 关闭所有连接
  public close(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.clients.forEach((client, clientId) => {
      this.removeClient(clientId);
    });

    this.wss.close();
    logger.info('WebSocket service closed');
  }

  // 注册自定义消息处理器
  public registerMessageHandler(type: string, handler: (client: WebSocketClient, data: any) => void): void {
    this.messageHandlers.set(type, handler);
    logger.debug(`Registered WebSocket message handler: ${type}`);
  }

  // 移除消息处理器
  public removeMessageHandler(type: string): void {
    this.messageHandlers.delete(type);
    logger.debug(`Removed WebSocket message handler: ${type}`);
  }
}