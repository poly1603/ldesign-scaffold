import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class Logger {
  private static spinner: Ora | null = null;

  /**
   * 成功信息
   */
  static success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  /**
   * 错误信息
   */
  static error(message: string): void {
    console.error(chalk.red('✗'), message);
  }

  /**
   * 警告信息
   */
  static warn(message: string): void {
    console.warn(chalk.yellow('⚠'), message);
  }

  /**
   * 信息
   */
  static info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  /**
   * 调试信息
   */
  static debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🐛'), message);
    }
  }

  /**
   * 开始加载动画
   */
  static startSpinner(message: string): void {
    this.spinner = ora(message).start();
  }

  /**
   * 成功结束加载动画
   */
  static succeedSpinner(message?: string): void {
    if (this.spinner) {
      this.spinner.succeed(message);
      this.spinner = null;
    }
  }

  /**
   * 失败结束加载动画
   */
  static failSpinner(message?: string): void {
    if (this.spinner) {
      this.spinner.fail(message);
      this.spinner = null;
    }
  }

  /**
   * 停止加载动画
   */
  static stopSpinner(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }

  /**
   * 打印标题
   */
  static title(message: string): void {
    console.log();
    console.log(chalk.bold.cyan(message));
    console.log(chalk.cyan('='.repeat(message.length)));
    console.log();
  }

  /**
   * 打印分隔线
   */
  static divider(): void {
    console.log(chalk.gray('-'.repeat(50)));
  }

  /**
   * 清空控制台
   */
  static clear(): void {
    console.clear();
  }

  /**
   * 打印空行
   */
  static newLine(): void {
    console.log();
  }
}

// 导出便捷方法
export const { success, error, warn, info, debug, title, divider, clear, newLine } = Logger;
export const { startSpinner, succeedSpinner, failSpinner, stopSpinner } = Logger;