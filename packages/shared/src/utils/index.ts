import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { LogLevel } from '../types';

// 文件操作工具
export class FileUtils {
  /**
   * 确保目录存在
   */
  static async ensureDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
  }

  /**
   * 复制文件或目录
   */
  static async copy(src: string, dest: string): Promise<void> {
    await fs.copy(src, dest);
  }

  /**
   * 写入文件
   */
  static async writeFile(filePath: string, content: string): Promise<void> {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf8');
  }

  /**
   * 读取文件
   */
  static async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf8');
  }

  /**
   * 检查文件是否存在
   */
  static async exists(filePath: string): Promise<boolean> {
    return await fs.pathExists(filePath);
  }

  /**
   * 删除文件或目录
   */
  static async remove(filePath: string): Promise<void> {
    await fs.remove(filePath);
  }

  /**
   * 获取目录下的所有文件
   */
  static async readDir(dirPath: string): Promise<string[]> {
    return await fs.readdir(dirPath);
  }
}

// 日志工具
export class Logger {
  private static level: LogLevel = LogLevel.INFO;

  static setLevel(level: LogLevel): void {
    this.level = level;
  }

  static error(message: string, ...args: any[]): void {
    console.error(chalk.red(`[ERROR] ${message}`), ...args);
  }

  static warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(chalk.yellow(`[WARN] ${message}`), ...args);
    }
  }

  static info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(chalk.blue(`[INFO] ${message}`), ...args);
    }
  }

  static debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(chalk.gray(`[DEBUG] ${message}`), ...args);
    }
  }

  static success(message: string, ...args: any[]): void {
    console.log(chalk.green(`[SUCCESS] ${message}`), ...args);
  }

  private static shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.level);
  }
}

// 字符串工具
export class StringUtils {
  /**
   * 转换为驼峰命名
   */
  static toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * 转换为短横线命名
   */
  static toKebabCase(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }

  /**
   * 转换为帕斯卡命名
   */
  static toPascalCase(str: string): string {
    return str.replace(/(^|-)([a-z])/g, (g) => g.replace('-', '').toUpperCase());
  }

  /**
   * 验证项目名称
   */
  static isValidProjectName(name: string): boolean {
    return /^[a-z0-9-_]+$/.test(name);
  }
}

// 路径工具
export class PathUtils {
  /**
   * 规范化路径
   */
  static normalize(filePath: string): string {
    return path.normalize(filePath);
  }

  /**
   * 连接路径
   */
  static join(...paths: string[]): string {
    return path.join(...paths);
  }

  /**
   * 获取文件扩展名
   */
  static extname(filePath: string): string {
    return path.extname(filePath);
  }

  /**
   * 获取文件名（不含扩展名）
   */
  static basename(filePath: string, ext?: string): string {
    return path.basename(filePath, ext);
  }

  /**
   * 获取目录名
   */
  static dirname(filePath: string): string {
    return path.dirname(filePath);
  }

  /**
   * 解析路径
   */
  static parse(filePath: string): path.ParsedPath {
    return path.parse(filePath);
  }

  /**
   * 获取相对路径
   */
  static relative(from: string, to: string): string {
    return path.relative(from, to);
  }

  /**
   * 获取绝对路径
   */
  static resolve(...paths: string[]): string {
    return path.resolve(...paths);
  }
}

// 版本工具
export class VersionUtils {
  /**
   * 比较版本号
   */
  static compare(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    
    return 0;
  }

  /**
   * 验证版本号格式
   */
  static isValid(version: string): boolean {
    return /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?$/.test(version);
  }

  /**
   * 增加版本号
   */
  static increment(version: string, type: 'major' | 'minor' | 'patch' = 'patch'): string {
    const parts = version.split('.').map(Number);
    
    switch (type) {
      case 'major':
        parts[0]++;
        parts[1] = 0;
        parts[2] = 0;
        break;
      case 'minor':
        parts[1]++;
        parts[2] = 0;
        break;
      case 'patch':
        parts[2]++;
        break;
    }
    
    return parts.join('.');
  }
}