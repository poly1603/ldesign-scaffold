#!/usr/bin/env node

// 测试示例项目的构建功能
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log('🧪 开始测试示例项目构建功能...\n');

const examples = [
  {
    name: 'Vue 3 示例',
    path: 'examples/vue3-example',
    expectedFiles: ['dist/index.html', 'dist/assets']
  },
  {
    name: 'Vue 2 示例', 
    path: 'examples/vue2-example',
    expectedFiles: ['dist/index.html', 'dist/assets']
  },
  {
    name: 'React 示例',
    path: 'examples/react-example', 
    expectedFiles: ['dist/index.html', 'dist/assets']
  }
];

let successCount = 0;
let totalCount = examples.length;

for (const example of examples) {
  console.log(`📦 测试 ${example.name}...`);
  
  try {
    // 清理之前的构建产物
    const distPath = path.join(example.path, 'dist');
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true });
      console.log(`  🧹 清理旧的构建产物`);
    }
    
    // 执行构建
    console.log(`  🔨 开始构建...`);
    const buildOutput = execSync(`pnpm run build`, {
      cwd: example.path,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // 检查构建产物
    let allFilesExist = true;
    for (const file of example.expectedFiles) {
      const filePath = path.join(example.path, file);
      if (!fs.existsSync(filePath)) {
        console.log(`  ❌ 缺少文件: ${file}`);
        allFilesExist = false;
      }
    }
    
    if (allFilesExist) {
      console.log(`  ✅ ${example.name} 构建成功`);
      successCount++;
      
      // 显示构建产物信息
      const distFiles = fs.readdirSync(path.join(example.path, 'dist'));
      console.log(`  📁 构建产物: ${distFiles.join(', ')}`);
    } else {
      console.log(`  ❌ ${example.name} 构建失败 - 缺少必要文件`);
    }
    
  } catch (error) {
    console.log(`  ❌ ${example.name} 构建失败:`);
    console.log(`     ${error.message}`);
  }
  
  console.log('');
}

// 测试脚手架命令
console.log('🔧 测试脚手架命令...');

const commands = [
  { name: 'help', cmd: 'node dist/cli.js --help', expectText: 'Enterprise-level Node.js scaffold generator' },
  { name: 'version', cmd: 'node dist/cli.js --version', expectText: '1.0.0' },
  { name: 'list', cmd: 'node dist/cli.js list', expectText: '可用模板' },
];

let commandSuccessCount = 0;

for (const command of commands) {
  try {
    const output = execSync(command.cmd, { encoding: 'utf8', stdio: 'pipe' });
    if (output.includes(command.expectText)) {
      console.log(`  ✅ ${command.name} 命令正常`);
      commandSuccessCount++;
    } else {
      console.log(`  ❌ ${command.name} 命令输出异常`);
    }
  } catch (error) {
    console.log(`  ❌ ${command.name} 命令执行失败: ${error.message}`);
  }
}

// 测试包依赖
console.log('\n📦 检查示例项目依赖...');

let depSuccessCount = 0;
for (const example of examples) {
  const packageJsonPath = path.join(example.path, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const devDeps = packageJson.devDependencies || {};
    
    // 检查是否不包含 vite 相关依赖
    const hasVite = 'vite' in devDeps;
    const hasVitePlugins = Object.keys(devDeps).some(dep => dep.startsWith('@vitejs/'));
    
    if (!hasVite && !hasVitePlugins) {
      console.log(`  ✅ ${example.name} - 正确移除了 vite 依赖`);
      depSuccessCount++;
    } else {
      console.log(`  ❌ ${example.name} - 仍包含 vite 相关依赖`);
      if (hasVite) console.log(`    - 包含 vite`);
      if (hasVitePlugins) console.log(`    - 包含 vite 插件`);
    }
    
    // 检查是否包含 ldesign-scaffold
    if ('ldesign-scaffold' in devDeps) {
      console.log(`  ✅ ${example.name} - 包含 ldesign-scaffold 依赖`);
    } else {
      console.log(`  ❌ ${example.name} - 缺少 ldesign-scaffold 依赖`);
    }
  }
}

// 总结
console.log('\n📊 测试总结:');
console.log(`- 示例项目构建: ${successCount}/${totalCount} 成功`);
console.log(`- 脚手架命令: ${commandSuccessCount}/${commands.length} 正常`);
console.log(`- 依赖配置: ${depSuccessCount}/${totalCount} 正确`);

if (successCount === totalCount && commandSuccessCount === commands.length && depSuccessCount === totalCount) {
  console.log(chalk.green('\n🎉 所有测试通过！脚手架功能正常！'));
  console.log(chalk.blue('\n✨ 现在示例项目可以：'));
  console.log(chalk.blue('  - 仅依赖 ldesign-scaffold 脚手架'));
  console.log(chalk.blue('  - 使用脚手架内置的 vite 和插件'));
  console.log(chalk.blue('  - 正常进行开发、构建和预览'));
} else {
  console.log(chalk.red('\n❌ 部分测试失败，请检查上述错误'));
  process.exit(1);
}

console.log(chalk.gray('\n📝 使用方法:'));
console.log(chalk.gray('  cd examples/vue3-example && pnpm run dev    # 启动开发服务器'));
console.log(chalk.gray('  cd examples/vue3-example && pnpm run build  # 构建项目'));
console.log(chalk.gray('  cd examples/vue3-example && pnpm run preview # 预览构建结果'));
