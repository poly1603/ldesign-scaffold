import semver from 'semver';
import chalk from 'chalk';
import { execSync } from 'child_process';

const REQUIRED_NODE_VERSION = '18.0.0';
const REQUIRED_PNPM_VERSION = '8.0.0';

/**
 * 检查 Node.js 版本
 */
export function checkNodeVersion(): void {
  const currentVersion = process.version;
  
  if (!semver.gte(currentVersion, REQUIRED_NODE_VERSION)) {
    console.error(
      chalk.red(
        `错误: 需要 Node.js ${REQUIRED_NODE_VERSION} 或更高版本，当前版本: ${currentVersion}`
      )
    );
    console.log(
      chalk.yellow('请访问 https://nodejs.org/ 下载最新版本的 Node.js')
    );
    process.exit(1);
  }
}

/**
 * 检查 pnpm 版本
 */
export function checkPnpmVersion(): boolean {
  try {
    const version = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    
    if (!semver.gte(version, REQUIRED_PNPM_VERSION)) {
      console.warn(
        chalk.yellow(
          `警告: 建议使用 pnpm ${REQUIRED_PNPM_VERSION} 或更高版本，当前版本: ${version}`
        )
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn(
      chalk.yellow(
        '警告: 未检测到 pnpm，建议安装 pnpm 以获得更好的性能'
      )
    );
    console.log(
      chalk.blue('安装命令: npm install -g pnpm')
    );
    return false;
  }
}

/**
 * 检查包管理器版本
 */
export function checkPackageManager(manager: 'npm' | 'yarn' | 'pnpm'): boolean {
  try {
    const version = execSync(`${manager} --version`, { encoding: 'utf8' }).trim();
    console.log(chalk.green(`✓ ${manager} 版本: ${version}`));
    return true;
  } catch (error) {
    console.error(chalk.red(`✗ 未找到 ${manager}`));
    return false;
  }
}