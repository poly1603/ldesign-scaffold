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
      displayName: 'Vue 3 基础项目',
      description: 'Vue 3 项目，使用 Vite 构建工具，支持 TypeScript + JSX + Less',
      framework: 'vue3',
      buildTool: 'vite',
      packageManager: 'pnpm',
      features: ['typescript', 'jsx', 'less', 'vue-router', 'pinia', 'eslint', 'prettier'],
      dependencies: {
        'vue': '^3.3.0',
        'vue-router': '^4.2.0',
        'pinia': '^2.1.0'
      },
      devDependencies: {
        '@vitejs/plugin-vue': '^4.4.0',
        '@vitejs/plugin-vue-jsx': '^3.0.0',
        'vite': '^4.4.0',
        'typescript': '^5.0.0',
        '@vue/tsconfig': '^0.4.0',
        'less': '^4.1.3'
      },
      scripts: {
        'dev': 'vite',
        'build': 'vue-tsc && vite build',
        'preview': 'vite preview'
      },
      templatePath: 'vue3-basic'
    },
    {
      name: 'vue3-component-lib',
      displayName: 'Vue 3 组件库',
      description: 'Vue 3 组件库开发模板，支持 TypeScript + JSX + Less，包含文档生成和多格式打包',
      framework: 'vue3',
      buildTool: 'vite',
      packageManager: 'pnpm',
      features: ['typescript', 'jsx', 'less', 'vite', 'rollup', 'vitepress', 'vitest', 'storybook'],
      dependencies: {
        'vue': '^3.3.0'
      },
      devDependencies: {
        '@vitejs/plugin-vue': '^4.4.0',
        '@vitejs/plugin-vue-jsx': '^3.0.0',
        'vite': '^4.4.0',
        'typescript': '^5.0.0',
        'less': '^4.1.3',
        'vitest': '^0.34.0',
        'storybook': '^7.0.0'
      },
      scripts: {
        'dev': 'storybook dev -p 6006',
        'build': 'npm run build:lib && npm run build:types',
        'test': 'vitest'
      },
      templatePath: 'vue3-component-lib'
    },
    {
      name: 'vue2-basic',
      displayName: 'Vue 2 基础项目',
      description: 'Vue 2 项目，使用 Webpack 构建工具，支持 TypeScript + JSX + Less',
      framework: 'vue2',
      buildTool: 'webpack',
      packageManager: 'pnpm',
      features: ['typescript', 'jsx', 'less', 'vue-router', 'vuex', 'eslint', 'prettier'],
      dependencies: {
        'vue': '^2.7.14',
        'vue-router': '^3.6.0',
        'vuex': '^3.6.0'
      },
      devDependencies: {
        'vue-loader': '^15.10.1',
        'vue-template-compiler': '^2.7.14',
        'webpack': '^5.88.0',
        'typescript': '^5.0.0',
        'less': '^4.1.3'
      },
      scripts: {
        'dev': 'webpack serve',
        'build': 'webpack --mode production'
      },
      templatePath: 'vue2-basic'
    },
    {
      name: 'vue2-component-lib',
      displayName: 'Vue 2 组件库',
      description: 'Vue 2 组件库开发模板，支持 TypeScript + JSX + Less，包含文档生成和多格式打包',
      framework: 'vue2',
      buildTool: 'rollup',
      packageManager: 'pnpm',
      features: ['typescript', 'jsx', 'less', 'rollup', 'vuepress', 'jest', 'storybook'],
      dependencies: {
        'vue': '^2.7.14',
        'vue-class-component': '^7.2.6',
        'vue-property-decorator': '^9.1.2'
      },
      devDependencies: {
        'rollup': '^3.25.0',
        'typescript': '^5.0.0',
        'less': '^4.1.3',
        'jest': '^29.5.0',
        'storybook': '^7.0.0'
      },
      scripts: {
        'dev': 'storybook dev -p 6006',
        'build': 'npm run build:lib && npm run build:types',
        'test': 'jest'
      },
      templatePath: 'vue2-component-lib'
    },
    {
      name: 'react-basic',
      displayName: 'React 基础项目',
      description: 'React 项目，使用 Vite 构建工具，支持 TypeScript + JSX + Less',
      framework: 'react',
      buildTool: 'vite',
      packageManager: 'pnpm',
      features: ['typescript', 'jsx', 'less', 'react-router', 'eslint', 'prettier'],
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.14.0'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.0.0',
        'vite': '^4.4.0',
        'typescript': '^5.0.0',
        'less': '^4.1.3'
      },
      scripts: {
        'dev': 'vite',
        'build': 'tsc && vite build',
        'preview': 'vite preview'
      },
      templatePath: 'react-basic'
    },
    {
      name: 'react-component-lib',
      displayName: 'React 组件库',
      description: 'React 组件库开发模板，支持 TypeScript + JSX + Less，包含 Storybook 和多格式打包',
      framework: 'react',
      buildTool: 'rollup',
      packageManager: 'pnpm',
      features: ['typescript', 'jsx', 'less', 'rollup', 'storybook', 'jest'],
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        'rollup': '^3.25.0',
        'typescript': '^5.0.0',
        'less': '^4.1.3',
        'jest': '^29.5.0',
        'storybook': '^7.0.0'
      },
      scripts: {
        'dev': 'storybook dev -p 6006',
        'build': 'npm run build:lib && npm run build:types',
        'test': 'jest'
      },
      templatePath: 'react-component-lib'
    },
    {
      name: 'typescript-lib',
      displayName: 'TypeScript 工具库',
      description: 'TypeScript 工具库模板，包含开发环境、测试配置、打包发布',
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
      name: 'nodejs-api',
      displayName: 'Node.js API 服务',
      description: 'Node.js API 服务模板，包含 Express/Koa 框架、数据库集成、API 文档',
      framework: 'nodejs',
      buildTool: 'tsup',
      packageManager: 'pnpm',
      features: ['typescript', 'express', 'prisma', 'swagger', 'jest', 'eslint'],
      dependencies: {
        'express': '^4.18.0',
        'cors': '^2.8.5',
        'helmet': '^7.0.0',
        'dotenv': '^16.3.0'
      },
      devDependencies: {
        'typescript': '^5.0.0',
        'tsup': '^7.2.0',
        '@types/node': '^20.5.0',
        '@types/express': '^4.17.0',
        'jest': '^29.6.0',
        '@types/jest': '^29.5.0',
        'nodemon': '^3.0.0'
      },
      scripts: {
        'dev': 'nodemon --exec tsup --watch src',
        'build': 'tsup',
        'start': 'node dist/index.js',
        'test': 'jest'
      },
      templatePath: 'nodejs-api'
    },
    {
      name: 'less-style-lib',
      displayName: 'Less 样式库',
      description: 'Less 样式库模板，包含样式组件、主题系统、打包发布',
      framework: 'less',
      buildTool: 'rollup',
      packageManager: 'pnpm',
      features: ['less', 'rollup', 'autoprefixer', 'postcss'],
      dependencies: {},
      devDependencies: {
        'less': '^4.2.0',
        'rollup': '^3.29.0',
        'rollup-plugin-postcss': '^4.0.0',
        'autoprefixer': '^10.4.0',
        'postcss': '^8.4.0'
      },
      scripts: {
        'build': 'rollup -c',
        'dev': 'rollup -c -w',
        'watch': 'rollup -c -w'
      },
      templatePath: 'less-style-lib'
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
  // 读取所有文件，包括隐藏文件
  const files = await fs.default.readdir(srcDir, { withFileTypes: true });

  for (const dirent of files) {
    const file = dirent.name;
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);

    if (dirent.isDirectory()) {
      await fs.default.ensureDir(destPath);
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
