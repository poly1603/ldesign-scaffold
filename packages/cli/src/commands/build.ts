import { Command } from 'commander';
import path from 'path';
import { execa } from 'execa';
import chalk from 'chalk';
import ora from 'ora';
import { BuildOptions } from '../types/index.js';
import { readJsonFile, fileExists, getFileStats } from '../utils/file-utils.js';
import { detectPackageManager, getRunCommand } from '../utils/package-manager.js';

export const buildCommand = new Command()
  .name('build')
  .description('构建项目')
  .option('-m, --mode <mode>', '构建模式', 'production')
  .option('-t, --target <target>', '构建目标')
  .option('-o, --out-dir <dir>', '输出目录', 'dist')
  .option('--sourcemap', '生成 sourcemap')
  .option('--no-minify', '不压缩代码')
  .option('--analyze', '分析构建产物')
  .action(async (options: BuildOptions) => {
    await buildProject(options);
  });

/**
 * 构建项目
 */
export async function buildProject(options: BuildOptions = {}): Promise<void> {
  try {
    const cwd = process.cwd();
    
    // 检查是否存在 package.json
    const packageJsonPath = path.join(cwd, 'package.json');
    if (!(await fileExists(packageJsonPath))) {
      console.error(chalk.red('当前目录不是一个有效的项目目录（未找到 package.json）'));
      return;
    }
    
    // 读取 package.json
    const packageJson = await readJsonFile(packageJsonPath);
    
    // 检查是否有 build 脚本
    if (!packageJson.scripts?.build) {
      console.error(chalk.red('package.json 中未找到 build 脚本'));
      console.log(chalk.blue('请确保项目配置了构建脚本'));
      return;
    }
    
    // 检测项目类型和构建工具
    const projectInfo = detectProjectType(packageJson);
    console.log(chalk.blue(`检测到项目类型: ${projectInfo.framework}`));
    console.log(chalk.blue(`构建工具: ${projectInfo.buildTool}`));
    
    // 构建环境变量
    const env = buildBuildEnv(options, projectInfo);
    
    // 清理之前的构建产物
    await cleanBuildOutput(cwd, options.outDir || 'dist');
    
    // 获取包管理器
    const packageManager = detectPackageManager();
    const command = getRunCommand(packageManager, 'build');
    
    console.log(chalk.green('🔨 正在构建项目...'));
    console.log();
    
    const startTime = Date.now();
    
    // 执行构建
    await execa(command[0], command.slice(1), {
      cwd,
      stdio: 'inherit',
      env: {
        ...process.env,
        ...env
      }
    });
    
    const buildTime = Date.now() - startTime;
    
    // 分析构建结果
    await analyzeBuildResult(cwd, options.outDir || 'dist', buildTime);
    
    console.log(chalk.green('✅ 项目构建完成!'));
    
  } catch (err) {
    console.error(chalk.red(`项目构建失败: ${err}`));
    process.exit(1);
  }
}

/**
 * 检测项目类型
 */
function detectProjectType(packageJson: any): {
  framework: string;
  buildTool: string;
} {
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  let framework = 'unknown';
  let buildTool = 'unknown';
  
  // 检测框架
  if (dependencies.vue && dependencies.vue.startsWith('^3')) {
    framework = 'Vue 3';
  } else if (dependencies.vue && dependencies.vue.startsWith('^2')) {
    framework = 'Vue 2';
  } else if (dependencies.react) {
    framework = 'React';
  } else if (dependencies.typescript && !dependencies.vue && !dependencies.react) {
    framework = 'TypeScript Library';
  } else if (dependencies.less) {
    framework = 'Less Library';
  } else {
    framework = 'Node.js';
  }
  
  // 检测构建工具
  if (dependencies.vite) {
    buildTool = 'Vite';
  } else if (dependencies.rollup) {
    buildTool = 'Rollup';
  } else if (dependencies.tsup) {
    buildTool = 'tsup';
  } else if (dependencies.webpack) {
    buildTool = 'Webpack';
  }
  
  return { framework, buildTool };
}

/**
 * 构建构建环境变量
 */
function buildBuildEnv(options: BuildOptions, _projectInfo: any): Record<string, string> {
  const env: Record<string, string> = {};
  
  // 设置构建模式
  env.NODE_ENV = options.mode || 'production';
  
  // 设置输出目录
  if (options.outDir) {
    env.BUILD_OUTDIR = options.outDir;
    env.VITE_BUILD_OUTDIR = options.outDir;
  }
  
  // 设置构建目标
  if (options.target) {
    env.BUILD_TARGET = options.target;
    env.VITE_BUILD_TARGET = options.target;
  }
  
  // 设置 sourcemap
  if (options.sourcemap) {
    env.BUILD_SOURCEMAP = 'true';
    env.VITE_BUILD_SOURCEMAP = 'true';
  }
  
  // 设置压缩
  if (options.minify === false) {
    env.BUILD_MINIFY = 'false';
    env.VITE_BUILD_MINIFY = 'false';
  }
  
  return env;
}

/**
 * 清理构建输出
 */
async function cleanBuildOutput(cwd: string, outDir: string): Promise<void> {
  try {
    const fs = await import('fs-extra');
    const outputPath = path.join(cwd, outDir);
    
    if (await fs.pathExists(outputPath)) {
      const spinner = ora('正在清理构建产物...').start();
      await fs.remove(outputPath);
      spinner.succeed('构建产物清理完成');
    }
  } catch (err) {
    console.log(chalk.yellow(`清理构建产物失败: ${err}`));
  }
}

/**
 * 分析构建结果
 */
async function analyzeBuildResult(cwd: string, outDir: string, buildTime: number): Promise<void> {
  try {
    const outputPath = path.join(cwd, outDir);
    const stats = await getFileStats(outputPath);
    
    if (!stats) {
      console.log(chalk.yellow('未找到构建产物'));
      return;
    }
    
    console.log();
    console.log(chalk.blue('📊 构建分析:'));
    console.log(`  构建时间: ${(buildTime / 1000).toFixed(2)}s`);
    console.log(`  输出目录: ${outDir}`);
    
    // 分析文件大小
    await analyzeFileSize(outputPath);
    
  } catch (err) {
    console.log(chalk.yellow(`构建分析失败: ${err}`));
  }
}

/**
 * 分析文件大小
 */
async function analyzeFileSize(outputPath: string): Promise<void> {
  try {
    const fs = await import('fs-extra');
    const files = await fs.readdir(outputPath, { withFileTypes: true });
    
    const fileStats: Array<{ name: string; size: number; type: string }> = [];
    
    for (const file of files) {
      if (file.isFile()) {
        const filePath = path.join(outputPath, file.name);
        const stats = await fs.stat(filePath);
        const ext = path.extname(file.name);
        
        fileStats.push({
          name: file.name,
          size: stats.size,
          type: getFileType(ext)
        });
      }
    }
    
    // 按大小排序
    fileStats.sort((a, b) => b.size - a.size);
    
    // 显示文件大小信息
    if (fileStats.length > 0) {
      console.log('  文件大小:');
      
      fileStats.slice(0, 10).forEach(file => {
        const sizeStr = formatFileSize(file.size);
        const typeStr = file.type.padEnd(8);
        console.log(`    ${typeStr} ${file.name.padEnd(30)} ${sizeStr}`);
      });
      
      if (fileStats.length > 10) {
        console.log(`    ... 还有 ${fileStats.length - 10} 个文件`);
      }
      
      const totalSize = fileStats.reduce((sum, file) => sum + file.size, 0);
      console.log(`  总大小: ${formatFileSize(totalSize)}`);
    }
    
  } catch (err) {
    console.log(chalk.yellow(`文件大小分析失败: ${err}`));
  }
}

/**
 * 获取文件类型
 */
function getFileType(ext: string): string {
  const typeMap: Record<string, string> = {
    '.js': 'JS',
    '.mjs': 'JS',
    '.ts': 'TS',
    '.css': 'CSS',
    '.html': 'HTML',
    '.json': 'JSON',
    '.map': 'MAP',
    '.woff': 'FONT',
    '.woff2': 'FONT',
    '.ttf': 'FONT',
    '.eot': 'FONT',
    '.png': 'IMAGE',
    '.jpg': 'IMAGE',
    '.jpeg': 'IMAGE',
    '.gif': 'IMAGE',
    '.svg': 'IMAGE',
    '.ico': 'IMAGE'
  };
  
  return typeMap[ext.toLowerCase()] || 'OTHER';
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 获取构建统计信息
 */
export async function getBuildStats(cwd: string, outDir = 'dist'): Promise<{
  files: number;
  totalSize: number;
  buildTime?: number;
}> {
  try {
    const fs = await import('fs-extra');
    const outputPath = path.join(cwd, outDir);
    
    if (!(await fs.pathExists(outputPath))) {
      return { files: 0, totalSize: 0 };
    }
    
    const files = await fs.readdir(outputPath, { withFileTypes: true });
    let totalSize = 0;
    let fileCount = 0;
    
    for (const file of files) {
      if (file.isFile()) {
        const filePath = path.join(outputPath, file.name);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
        fileCount++;
      }
    }
    
    return {
      files: fileCount,
      totalSize
    };
  } catch {
    return { files: 0, totalSize: 0 };
  }
}