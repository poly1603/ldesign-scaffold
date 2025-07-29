import { Command } from 'commander';
import chalk from 'chalk';
import { createCommand } from '../commands/create.js';
import { devCommand } from '../commands/dev.js';
import { buildCommand } from '../commands/build.js';
import { deployCommand } from '../commands/deploy.js';
import { uiCommand } from '../commands/ui.js';
import { checkNodeVersion } from '../utils/check-version.js';

const program = new Command();

// 检查 Node.js 版本
checkNodeVersion();

program
  .name('ldesign')
  .description('LDesign 多功能脚手架工具')
  .version('1.0.0', '-v, --version', '显示版本号')
  .helpOption('-h, --help', '显示帮助信息');

// 注册命令
program.addCommand(createCommand);
program.addCommand(devCommand);
program.addCommand(buildCommand);
program.addCommand(deployCommand);
program.addCommand(uiCommand);

// 处理未知命令
program.on('command:*', (operands) => {
  console.error(chalk.red(`未知命令: ${operands[0]}`));
  console.log(chalk.yellow('使用 ldesign --help 查看可用命令'));
  process.exit(1);
});

// 解析命令行参数
program.parse();

// 如果没有提供任何参数，显示友好的命令列表
if (!process.argv.slice(2).length) {
  console.log(chalk.cyan('🎨 LDesign 多功能脚手架工具'));
  console.log();
  console.log(chalk.bold('可用命令:'));
  console.log();
  console.log(chalk.green('  create <project-name>') + '  创建新项目');
  console.log(chalk.green('  ui') + '                     启动可视化界面');
  console.log(chalk.green('  dev') + '                    启动开发服务器');
  console.log(chalk.green('  build') + '                  构建项目');
  console.log(chalk.green('  deploy') + '                 部署项目');
  console.log();
  console.log(chalk.gray('使用 ldesign <command> --help 查看具体命令的帮助信息'));
  console.log(chalk.gray('使用 ldesign --help 查看完整帮助信息'));
}