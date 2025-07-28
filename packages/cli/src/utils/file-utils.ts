import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import validateNpmPackageName from 'validate-npm-package-name';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 检查目录是否存在且不为空
 */
export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
  try {
    const files = await fs.readdir(dirPath);
    return files.length === 0;
  } catch (error) {
    // 目录不存在，视为空
    return true;
  }
}

/**
 * 确保目录存在
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * 复制文件或目录
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest);
}

/**
 * 删除文件或目录
 */
export async function removeFile(filePath: string): Promise<void> {
  await fs.remove(filePath);
}

/**
 * 读取 JSON 文件
 */
export async function readJsonFile<T = any>(filePath: string): Promise<T> {
  return await fs.readJson(filePath);
}

/**
 * 写入 JSON 文件
 */
export async function writeJsonFile(filePath: string, data: any): Promise<void> {
  await fs.writeJson(filePath, data, { spaces: 2 });
}

/**
 * 读取文本文件
 */
export async function readTextFile(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf8');
}

/**
 * 写入文本文件
 */
export async function writeTextFile(filePath: string, content: string): Promise<void> {
  await fs.writeFile(filePath, content, 'utf8');
}

/**
 * 检查文件是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取文件状态
 */
export async function getFileStats(filePath: string): Promise<fs.Stats | null> {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

/**
 * 验证项目名称
 */
export function validateProjectName(name: string): { valid: boolean; errors: string[] } {
  const result = validateNpmPackageName(name);
  
  if (result.validForNewPackages) {
    return { valid: true, errors: [] };
  }
  
  const errors = [
    ...(result.errors || []),
    ...(result.warnings || [])
  ];
  
  return { valid: false, errors };
}

/**
 * 获取项目根目录
 */
export function getProjectRoot(): string {
  // 从当前文件向上查找 package.json
  let currentDir = __dirname;
  
  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  
  return process.cwd();
}

/**
 * 获取模板目录
 */
export function getTemplatesDir(): string {
  const projectRoot = getProjectRoot();
  return path.join(projectRoot, 'packages', 'templates');
}

/**
 * 清理目录（保留 .git 等隐藏文件）
 */
export async function cleanDirectory(dirPath: string, keepHidden = true): Promise<void> {
  try {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      if (keepHidden && file.startsWith('.')) {
        continue;
      }
      
      const filePath = path.join(dirPath, file);
      await fs.remove(filePath);
    }
  } catch (error) {
    console.error(chalk.red(`清理目录失败: ${error}`));
    throw error;
  }
}

/**
 * 创建符号链接
 */
export async function createSymlink(target: string, linkPath: string): Promise<void> {
  try {
    await fs.ensureDir(path.dirname(linkPath));
    await fs.symlink(target, linkPath);
  } catch (error) {
    console.error(chalk.red(`创建符号链接失败: ${error}`));
    throw error;
  }
}