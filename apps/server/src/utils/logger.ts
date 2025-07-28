import fs from 'fs-extra';
import path from 'path';
import { config } from '../config';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: any;
  pid: number;
}

class Logger {
  private logLevel: LogLevel;
  private logFile: string;
  private maxLogSize: number;
  private logQueue: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout;

  constructor() {
    this.logLevel = this.getLogLevel();
    this.logFile = path.join(config.paths.logs, 'server.log');
    this.maxLogSize = config.limits.maxLogSize;
    
    // 确保日志目录存在
    fs.ensureDirSync(config.paths.logs);
    
    // 定期刷新日志到文件
    this.flushInterval = setInterval(() => {
      this.flushLogs();
    }, 5000); // 每5秒刷新一次
  }

  private getLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    switch (level) {
      case 'ERROR': return LogLevel.ERROR;
      case 'WARN': return LogLevel.WARN;
      case 'INFO': return LogLevel.INFO;
      case 'DEBUG': return LogLevel.DEBUG;
      default: return LogLevel.INFO;
    }
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const pid = process.pid;
    
    let formatted = `[${timestamp}] [${level}] [PID:${pid}] ${message}`;
    
    if (meta) {
      if (meta instanceof Error) {
        formatted += `\n${meta.stack}`;
      } else if (typeof meta === 'object') {
        formatted += `\n${JSON.stringify(meta, null, 2)}`;
      } else {
        formatted += ` ${meta}`;
      }
    }
    
    return formatted;
  }

  private log(level: LogLevel, levelName: string, message: string, meta?: any): void {
    if (level > this.logLevel) {
      return;
    }

    const formatted = this.formatMessage(levelName, message, meta);
    
    // 输出到控制台
    if (level === LogLevel.ERROR) {
      console.error(formatted);
    } else if (level === LogLevel.WARN) {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }

    // 添加到日志队列
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: levelName,
      message,
      meta,
      pid: process.pid,
    };
    
    this.logQueue.push(logEntry);
  }

  private async flushLogs(): Promise<void> {
    if (this.logQueue.length === 0) {
      return;
    }

    try {
      // 检查日志文件大小
      await this.rotateLogIfNeeded();
      
      // 将队列中的日志写入文件
      const logs = this.logQueue.splice(0);
      const logLines = logs.map(entry => {
        const formatted = this.formatMessage(entry.level, entry.message, entry.meta);
        return formatted;
      }).join('\n') + '\n';
      
      await fs.appendFile(this.logFile, logLines, 'utf8');
    } catch (error) {
      console.error('Failed to flush logs:', error);
    }
  }

  private async rotateLogIfNeeded(): Promise<void> {
    try {
      const stats = await fs.stat(this.logFile);
      if (stats.size > this.maxLogSize) {
        const backupFile = `${this.logFile}.${Date.now()}`;
        await fs.move(this.logFile, backupFile);
        
        // 清理旧的备份文件（保留最近5个）
        await this.cleanupOldLogs();
      }
    } catch (error) {
      // 文件不存在或其他错误，忽略
    }
  }

  private async cleanupOldLogs(): Promise<void> {
    try {
      const logDir = path.dirname(this.logFile);
      const files = await fs.readdir(logDir);
      const logFiles = files
        .filter(file => file.startsWith('server.log.') && /\d+$/.test(file))
        .map(file => ({
          name: file,
          path: path.join(logDir, file),
          timestamp: parseInt(file.split('.').pop() || '0', 10),
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
      
      // 保留最近5个备份文件
      const filesToDelete = logFiles.slice(5);
      for (const file of filesToDelete) {
        await fs.remove(file.path);
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  public error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, meta);
  }

  public info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, meta);
  }

  public async getLogs(lines: number = 100): Promise<string[]> {
    try {
      // 先刷新当前队列中的日志
      await this.flushLogs();
      
      const content = await fs.readFile(this.logFile, 'utf8');
      const allLines = content.split('\n').filter(line => line.trim());
      return allLines.slice(-lines);
    } catch (error) {
      return [];
    }
  }

  public async clearLogs(): Promise<void> {
    try {
      await fs.writeFile(this.logFile, '', 'utf8');
      this.logQueue = [];
    } catch (error) {
      this.error('Failed to clear logs', error);
    }
  }

  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    // 最后一次刷新
    this.flushLogs();
  }
}

// 创建全局日志实例
export const logger = new Logger();

// 进程退出时清理
process.on('exit', () => {
  logger.destroy();
});

process.on('SIGINT', () => {
  logger.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.destroy();
  process.exit(0);
});

export default logger;