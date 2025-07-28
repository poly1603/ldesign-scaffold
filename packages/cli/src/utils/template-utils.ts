import path from 'path';
import { ProjectTemplate, TemplateContext } from '../types/index.js';
import { copyFile, readTextFile, writeTextFile, getTemplatesDir } from './file-utils.js';
import chalk from 'chalk';

/**
 * 获取所有可用模板
 */
export function getAvailableTemplates(): ProjectTemplate[] {
  return [
    {
      name: 'vue3-basic',
      displayName: 'Vue 3 + Vite',
      description: 'Vue 3 项目，使用 Vite 构建工具',
      framework: 'vue3',
      buildTool: 'vite',
      packageManager: 'pnpm',
      features: ['typescript', 'vue-router', 'pinia', 'eslint', 'prettier'],
      dependencies: {
        'vue': '^3.3.0',
        'vue-router': '^4.2.0',
        'pinia': '^2.1.0'
      },
      devDependencies: {
        '@vitejs/plugin-vue': '^4.4.0',
        'vite': '^4.4.0',
        'typescript': '^5.0.0',
        '@vue/tsconfig': '^0.4.0'
      },
      scripts: {
        'dev': 'vite',
        'build': 'vue-tsc && vite build',
        'preview': 'vite preview'
      },
      templatePath: 'vue3-basic'
    },
    {
      name: 'vue2-webpack',
      displayName: 'Vue 2 + Webpack',
      description: 'Vue 2 项目，使用 Webpack 构建工具',
      framework: 'vue2',
      buildTool: 'webpack',
      packageManager: 'npm',
      features: ['typescript', 'vue-router', 'vuex', 'eslint'],
      dependencies: {
        'vue': '^2.7.0',
        'vue-router': '^3.6.0',
        'vuex': '^3.6.0'
      },
      devDependencies: {
        'webpack': '^5.88.0',
        'vue-loader': '^17.2.0',
        'typescript': '^5.0.0'
      },
      scripts: {
        'dev': 'webpack serve',
        'build': 'webpack --mode production'
      },
      templatePath: 'vue2-webpack'
    },
    {
      name: 'react-vite',
      displayName: 'React + Vite',
      description: 'React 项目，使用 Vite 构建工具',
      framework: 'react',
      buildTool: 'vite',
      packageManager: 'pnpm',
      features: ['typescript', 'react-router', 'zustand', 'eslint', 'prettier'],
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.15.0',
        'zustand': '^4.4.0'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.0.0',
        'vite': '^4.4.0',
        'typescript': '^5.0.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0'
      },
      scripts: {
        'dev': 'vite',
        'build': 'tsc && vite build',
        'preview': 'vite preview'
      },
      templatePath: 'react-vite'
    },
    {
      name: 'typescript-lib',
      displayName: 'TypeScript Library',
      description: 'TypeScript 工具库，使用 Rollup 打包',
      framework: 'typescript',
      buildTool: 'rollup',
      packageManager: 'pnpm',
      features: ['typescript', 'rollup', 'jest', 'eslint', 'prettier'],
      dependencies: {},
      devDependencies: {
        'typescript': '^5.0.0',
        'rollup': '^3.29.0',
        '@rollup/plugin-typescript': '^11.1.0',
        'jest': '^29.6.0',
        '@types/jest': '^29.5.0'
      },
      scripts: {
        'build': 'rollup -c',
        'dev': 'rollup -c -w',
        'test': 'jest'
      },
      templatePath: 'typescript-lib'
    },
    {
      name: 'less-lib',
      displayName: 'Less Style Library',
      description: 'Less 样式库，使用 Rollup 打包',
      framework: 'less',
      buildTool: 'rollup',
      packageManager: 'pnpm',
      features: ['less', 'rollup', 'autoprefixer'],
      dependencies: {},
      devDependencies: {
        'less': '^4.2.0',
        'rollup': '^3.29.0',
        'rollup-plugin-postcss': '^4.0.0',
        'autoprefixer': '^10.4.0'
      },
      scripts: {
        'build': 'rollup -c',
        'dev': 'rollup -c -w'
      },
      templatePath: 'less-lib'
    },
    {
      name: 'nodejs-tsup',
      displayName: 'Node.js + tsup',
      description: 'Node.js 项目，使用 tsup 构建工具',
      framework: 'nodejs',
      buildTool: 'tsup',
      packageManager: 'pnpm',
      features: ['typescript', 'tsup', 'jest', 'eslint'],
      dependencies: {},
      devDependencies: {
        'typescript': '^5.0.0',
        'tsup': '^7.2.0',
        '@types/node': '^20.5.0',
        'jest': '^29.6.0',
        '@types/jest': '^29.5.0'
      },
      scripts: {
        'build': 'tsup',
        'dev': 'tsup --watch',
        'test': 'jest'
      },
      templatePath: 'nodejs-tsup'
    }
  ];
}

/**
 * 根据名称获取模板
 */
export function getTemplateByName(name: string): ProjectTemplate | undefined {
  const templates = getAvailableTemplates();
  return templates.find(template => template.name === name);
}

/**
 * 根据框架获取模板
 */
export function getTemplatesByFramework(framework: string): ProjectTemplate[] {
  const templates = getAvailableTemplates();
  return templates.filter(template => template.framework === framework);
}

/**
 * 渲染模板文件内容
 */
export function renderTemplate(content: string, context: TemplateContext): string {
  let result = content;
  
  // 替换模板变量
  Object.entries(context).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, String(value));
  });
  
  // 处理条件渲染
  result = result.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/#if}}/g, (_match, condition, content) => {
    return context[condition as keyof TemplateContext] ? content : '';
  });
  
  // 处理循环渲染
  result = result.replace(/{{#each\s+(\w+)}}([\s\S]*?){{\/#each}}/g, (_match, arrayName, content) => {
    const array = context[arrayName as keyof TemplateContext];
    if (Array.isArray(array)) {
      return array.map(item => content.replace(/{{this}}/g, item)).join('');
    }
    return '';
  });
  
  return result;
}

/**
 * 复制并渲染模板
 */
export async function copyAndRenderTemplate(
  templatePath: string,
  targetPath: string,
  context: TemplateContext
): Promise<void> {
  try {
    console.log(chalk.blue('正在复制模板文件...'));
    
    const templatesDir = getTemplatesDir();
    const fullTemplatePath = path.join(templatesDir, templatePath);
    
    // 递归复制并渲染模板文件
    await copyTemplateRecursive(fullTemplatePath, targetPath, context);
    
    console.log(chalk.green('模板文件复制完成'));
  } catch (error) {
    console.error(chalk.red('模板文件复制失败'));
    throw error;
  }
}

/**
 * 递归复制模板文件
 */
async function copyTemplateRecursive(
  srcDir: string,
  destDir: string,
  context: TemplateContext
): Promise<void> {
  const fs = await import('fs-extra');
  const files = await fs.readdir(srcDir);
  
  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    const stats = await fs.stat(srcPath);
    
    if (stats.isDirectory()) {
      await fs.ensureDir(destPath);
      await copyTemplateRecursive(srcPath, destPath, context);
    } else {
      // 检查是否是模板文件
      if (file.endsWith('.template')) {
        // 移除 .template 后缀
        const actualDestPath = destPath.replace(/\.template$/, '');
        const content = await readTextFile(srcPath);
        const renderedContent = renderTemplate(content, context);
        await writeTextFile(actualDestPath, renderedContent);
      } else {
        // 直接复制文件
        await copyFile(srcPath, destPath);
      }
    }
  }
}

/**
 * 创建模板上下文
 */
export function createTemplateContext(
  projectName: string,
  template: ProjectTemplate,
  options: any = {}
): TemplateContext {
  return {
    projectName,
    packageName: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    description: options.description || `${projectName} project`,
    author: options.author || '',
    email: options.email || '',
    framework: template.framework,
    buildTool: template.buildTool,
    packageManager: template.packageManager,
    features: template.features,
    typescript: template.features.includes('typescript'),
    eslint: template.features.includes('eslint'),
    prettier: template.features.includes('prettier'),
    husky: template.features.includes('husky'),
    commitlint: template.features.includes('commitlint')
  };
}
