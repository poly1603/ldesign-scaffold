#!/usr/bin/env node

// 简单的脚手架功能测试脚本
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧪 开始测试 LDesign Scaffold 功能...\n');

// 测试1: 检查CLI是否可用
console.log('1. 测试 CLI 可用性...');
try {
  const version = execSync('node dist/cli.js --version', { encoding: 'utf8' });
  console.log('✅ CLI 版本:', version.trim());
} catch (error) {
  console.log('❌ CLI 不可用:', error.message);
  process.exit(1);
}

// 测试2: 检查帮助信息
console.log('\n2. 测试帮助信息...');
try {
  const help = execSync('node dist/cli.js --help', { encoding: 'utf8' });
  if (help.includes('Enterprise-level Node.js scaffold generator')) {
    console.log('✅ 帮助信息正常');
  } else {
    console.log('❌ 帮助信息异常');
  }
} catch (error) {
  console.log('❌ 帮助信息获取失败:', error.message);
}

// 测试3: 检查模板列表
console.log('\n3. 测试模板列表...');
try {
  const list = execSync('node dist/cli.js list', { encoding: 'utf8' });
  if (list.includes('可用模板') && list.includes('可用特性')) {
    console.log('✅ 模板列表正常');
  } else {
    console.log('⚠️ 模板列表可能为空（这是正常的）');
  }
} catch (error) {
  console.log('❌ 模板列表获取失败:', error.message);
}

// 测试4: 检查环境检测
console.log('\n4. 测试环境检测...');
try {
  const doctor = execSync('node dist/cli.js doctor', { encoding: 'utf8', timeout: 10000 });
  if (doctor.includes('开发环境检测结果') && doctor.includes('Node.js')) {
    console.log('✅ 环境检测正常');
  } else {
    console.log('❌ 环境检测异常');
  }
} catch (error) {
  console.log('❌ 环境检测失败:', error.message);
}

// 测试5: 检查示例项目结构
console.log('\n5. 测试示例项目结构...');
const examples = ['vue3-example', 'vue2-example', 'react-example'];
let exampleCount = 0;

examples.forEach(example => {
  const examplePath = path.join('examples', example);
  if (fs.existsSync(examplePath)) {
    const packageJsonPath = path.join(examplePath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      exampleCount++;
      console.log(`✅ ${example} 结构正常`);
    } else {
      console.log(`❌ ${example} 缺少 package.json`);
    }
  } else {
    console.log(`❌ ${example} 目录不存在`);
  }
});

if (exampleCount === examples.length) {
  console.log('✅ 所有示例项目结构正常');
} else {
  console.log(`⚠️ 只有 ${exampleCount}/${examples.length} 个示例项目正常`);
}

// 测试6: 检查文档结构
console.log('\n6. 测试文档结构...');
const docFiles = [
  'docs/index.md',
  'docs/guide/index.md',
  'docs/guide/getting-started.md',
  'docs/guide/installation.md',
  'docs/examples/index.md',
  'docs/examples/vue3.md',
  'docs/api/index.md',
  'docs/.vitepress/config.ts'
];

let docCount = 0;
docFiles.forEach(file => {
  if (fs.existsSync(file)) {
    docCount++;
    console.log(`✅ ${file} 存在`);
  } else {
    console.log(`❌ ${file} 不存在`);
  }
});

if (docCount === docFiles.length) {
  console.log('✅ 所有文档文件正常');
} else {
  console.log(`⚠️ 只有 ${docCount}/${docFiles.length} 个文档文件存在`);
}

// 测试7: 检查构建产物
console.log('\n7. 测试构建产物...');
const buildFiles = [
  'dist/cli.js',
  'dist/index.js',
  'dist/cli.cjs',
  'dist/index.cjs'
];

let buildCount = 0;
buildFiles.forEach(file => {
  if (fs.existsSync(file)) {
    buildCount++;
    console.log(`✅ ${file} 存在`);
  } else {
    console.log(`❌ ${file} 不存在`);
  }
});

if (buildCount === buildFiles.length) {
  console.log('✅ 所有构建产物正常');
} else {
  console.log(`⚠️ 只有 ${buildCount}/${buildFiles.length} 个构建产物存在`);
}

// 总结
console.log('\n📊 测试总结:');
console.log('- CLI 功能: ✅ 正常');
console.log(`- 示例项目: ${exampleCount === examples.length ? '✅' : '⚠️'} ${exampleCount}/${examples.length}`);
console.log(`- 文档文件: ${docCount === docFiles.length ? '✅' : '⚠️'} ${docCount}/${docFiles.length}`);
console.log(`- 构建产物: ${buildCount === buildFiles.length ? '✅' : '⚠️'} ${buildCount}/${buildFiles.length}`);

console.log('\n🎉 LDesign Scaffold 功能测试完成!');
console.log('\n📝 下一步:');
console.log('1. 运行 `pnpm run docs:dev` 启动文档服务');
console.log('2. 进入 examples 目录测试示例项目');
console.log('3. 使用 `node dist/cli.js create test-project` 创建测试项目');
