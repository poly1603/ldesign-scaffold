import fs from 'fs-extra'
import path from 'path'
import { ProjectConfig, ProjectFeature } from '../types/index.js'
import { logger } from '../utils/index.js'

/**
 * 配置文件生成器
 */
export class ConfigGenerator {
  /**
   * 生成所有配置文件
   */
  async generateConfigs(projectPath: string, config: ProjectConfig): Promise<void> {
    const tasks = [
      this.generatePackageJson(projectPath, config),
      this.generateTsConfig(projectPath, config),
      this.generateEslintConfig(projectPath, config),
      this.generatePrettierConfig(projectPath, config),
      this.generateGitignore(projectPath, config),
      this.generateViteConfig(projectPath, config),
      this.generateRollupConfig(projectPath, config),
      this.generateTsupConfig(projectPath, config),
      this.generateVitestConfig(projectPath, config),
      this.generateDockerConfig(projectPath, config),
      this.generateNginxConfig(projectPath, config),
      this.generateGithubActions(projectPath, config)
    ]

    await Promise.all(tasks)
  }

  /**
   * 生成package.json
   */
  private async generatePackageJson(projectPath: string, config: ProjectConfig): Promise<void> {
    const packageJson = {
      name: config.name,
      version: config.version || '1.0.0',
      description: config.description || '',
      author: config.author || '',
      license: config.license || 'MIT',
      type: 'module',
      scripts: this.generateScripts(config),
      dependencies: this.generateDependencies(config),
      devDependencies: this.generateDevDependencies(config),
      keywords: this.generateKeywords(config),
      ...(config.type === 'vue3-component' && {
        main: 'dist/index.js',
        module: 'dist/index.esm.js',
        types: 'dist/index.d.ts',
        files: ['dist'],
        exports: {
          '.': {
            import: './dist/index.esm.js',
            require: './dist/index.js',
            types: './dist/index.d.ts'
          }
        }
      })
    }

    await fs.writeJSON(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 })
  }

  /**
   * 生成脚本命令
   */
  private generateScripts(config: ProjectConfig): Record<string, string> {
    const scripts: Record<string, string> = {}

    // 基础脚本
    if (config.buildTool === 'vite') {
      scripts.dev = 'vite'
      scripts.build = 'vite build'
      scripts.preview = 'vite preview'
    } else if (config.buildTool === 'rollup') {
      scripts.build = 'rollup -c'
      scripts.dev = 'rollup -c -w'
    } else if (config.buildTool === 'tsup') {
      scripts.build = 'tsup'
      scripts.dev = 'tsup --watch'
    }

    // TypeScript检查
    if (config.features.includes('typescript')) {
      scripts.check = 'tsc --noEmit'
    }

    // 测试脚本
    if (config.features.includes('vitest')) {
      scripts.test = 'vitest'
      scripts['test:ui'] = 'vitest --ui'
      scripts['test:coverage'] = 'vitest --coverage'
    } else if (config.features.includes('jest')) {
      scripts.test = 'jest'
      scripts['test:watch'] = 'jest --watch'
      scripts['test:coverage'] = 'jest --coverage'
    }

    // E2E测试
    if (config.features.includes('cypress')) {
      scripts['test:e2e'] = 'cypress run'
      scripts['test:e2e:dev'] = 'cypress open'
    } else if (config.features.includes('playwright')) {
      scripts['test:e2e'] = 'playwright test'
      scripts['test:e2e:ui'] = 'playwright test --ui'
    }

    // 代码质量
    if (config.features.includes('eslint')) {
      scripts.lint = 'eslint . --ext .ts,.tsx,.vue,.js,.jsx'
      scripts['lint:fix'] = 'eslint . --ext .ts,.tsx,.vue,.js,.jsx --fix'
    }

    if (config.features.includes('prettier')) {
      scripts.format = 'prettier --write .'
      scripts['format:check'] = 'prettier --check .'
    }

    // 文档
    if (config.features.includes('vitepress')) {
      scripts['docs:dev'] = 'vitepress dev docs'
      scripts['docs:build'] = 'vitepress build docs'
      scripts['docs:preview'] = 'vitepress preview docs'
    } else if (config.features.includes('storybook')) {
      scripts.storybook = 'storybook dev -p 6006'
      scripts['build-storybook'] = 'storybook build'
    }

    // Docker
    if (config.features.includes('docker')) {
      scripts['docker:build'] = 'docker build -t ' + config.name + ' .'
      scripts['docker:run'] = 'docker run -p 3000:3000 ' + config.name
    }

    return scripts
  }

  /**
   * 生成依赖
   */
  private generateDependencies(config: ProjectConfig): Record<string, string> {
    const deps: Record<string, string> = {}

    // Vue3项目依赖
    if (config.type === 'vue3-project' || config.type === 'vue3-component') {
      deps.vue = '^3.4.0'
      
      if (config.features.includes('router')) {
        deps['vue-router'] = '^4.2.0'
      }
      
      if (config.features.includes('store')) {
        deps.pinia = '^2.1.0'
      }
    }

    // Node.js API依赖
    if (config.type === 'nodejs-api') {
      deps.express = '^4.18.0'
      deps.cors = '^2.8.5'
      deps.helmet = '^7.1.0'
    }

    // UI库
    if (config.features.includes('ui-library')) {
      if (config.type.includes('vue')) {
        deps['element-plus'] = '^2.4.0'
      }
    }

    // 样式
    if (config.features.includes('tailwindcss')) {
      // Tailwind通常作为devDependency
    }

    // 国际化
    if (config.features.includes('i18n')) {
      if (config.type.includes('vue')) {
        deps['vue-i18n'] = '^9.8.0'
      }
    }

    return deps
  }

  /**
   * 生成开发依赖
   */
  private generateDevDependencies(config: ProjectConfig): Record<string, string> {
    const devDeps: Record<string, string> = {}

    // TypeScript
    if (config.features.includes('typescript')) {
      devDeps.typescript = '^5.3.0'
      devDeps['@types/node'] = '^20.10.0'
      
      if (config.type.includes('vue')) {
        devDeps['vue-tsc'] = '^1.8.0'
      }
    }

    // 构建工具
    if (config.buildTool === 'vite') {
      devDeps.vite = '^5.0.0'
      
      if (config.type.includes('vue')) {
        devDeps['@vitejs/plugin-vue'] = '^4.5.0'
      }
    } else if (config.buildTool === 'rollup') {
      devDeps.rollup = '^4.9.0'
      devDeps['@rollup/plugin-node-resolve'] = '^15.2.0'
      devDeps['@rollup/plugin-commonjs'] = '^25.0.0'
      devDeps['@rollup/plugin-typescript'] = '^11.1.0'
      
      if (config.type.includes('vue')) {
        devDeps['rollup-plugin-vue'] = '^6.0.0'
      }
    } else if (config.buildTool === 'tsup') {
      devDeps.tsup = '^8.0.0'
    }

    // 代码质量工具
    if (config.features.includes('eslint')) {
      devDeps.eslint = '^8.56.0'
      devDeps['@typescript-eslint/eslint-plugin'] = '^6.19.0'
      devDeps['@typescript-eslint/parser'] = '^6.19.0'
      
      if (config.type.includes('vue')) {
        devDeps['eslint-plugin-vue'] = '^9.19.0'
      }
    }

    if (config.features.includes('prettier')) {
      devDeps.prettier = '^3.1.0'
      devDeps['eslint-config-prettier'] = '^9.1.0'
      devDeps['eslint-plugin-prettier'] = '^5.1.0'
    }

    // 测试工具
    if (config.features.includes('vitest')) {
      devDeps.vitest = '^1.1.0'
      devDeps['@vitest/ui'] = '^1.1.0'
      devDeps['@vitest/coverage-v8'] = '^1.1.0'
      
      if (config.type.includes('vue')) {
        devDeps['@vue/test-utils'] = '^2.4.0'
      }
    } else if (config.features.includes('jest')) {
      devDeps.jest = '^29.7.0'
      devDeps['@types/jest'] = '^29.5.0'
      devDeps['ts-jest'] = '^29.1.0'
    }

    // E2E测试
    if (config.features.includes('cypress')) {
      devDeps.cypress = '^13.6.0'
    } else if (config.features.includes('playwright')) {
      devDeps['@playwright/test'] = '^1.40.0'
    }

    // 样式
    if (config.features.includes('tailwindcss')) {
      devDeps.tailwindcss = '^3.4.0'
      devDeps.autoprefixer = '^10.4.0'
      devDeps.postcss = '^8.4.0'
    }

    if (config.features.includes('sass')) {
      devDeps.sass = '^1.69.0'
    }

    if (config.features.includes('less')) {
      devDeps.less = '^4.2.0'
    }

    // 文档
    if (config.features.includes('vitepress')) {
      devDeps.vitepress = '^1.0.0'
    } else if (config.features.includes('storybook')) {
      devDeps['@storybook/vue3'] = '^7.6.0'
      devDeps['@storybook/vue3-vite'] = '^7.6.0'
    }

    // Git hooks
    if (config.features.includes('husky')) {
      devDeps.husky = '^8.0.0'
      devDeps['lint-staged'] = '^15.2.0'
    }

    if (config.features.includes('commitlint')) {
      devDeps['@commitlint/cli'] = '^18.4.0'
      devDeps['@commitlint/config-conventional'] = '^18.4.0'
    }

    return devDeps
  }

  /**
   * 生成关键词
   */
  private generateKeywords(config: ProjectConfig): string[] {
    const keywords = [config.type]
    
    if (config.features.includes('typescript')) keywords.push('typescript')
    if (config.type.includes('vue')) keywords.push('vue', 'vue3')
    if (config.buildTool) keywords.push(config.buildTool)
    
    return keywords
  }

  /**
   * 生成TypeScript配置
   */
  private async generateTsConfig(projectPath: string, config: ProjectConfig): Promise<void> {
    if (!config.features.includes('typescript')) return

    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: config.type.includes('vue') ? 'preserve' : 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        ...(config.type.includes('vue') && {
          baseUrl: '.',
          paths: {
            '@/*': ['src/*']
          }
        })
      },
      include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
      references: [{ path: './tsconfig.node.json' }]
    }

    await fs.writeJSON(path.join(projectPath, 'tsconfig.json'), tsConfig, { spaces: 2 })

    // 生成Node.js配置
    const nodeConfig = {
      compilerOptions: {
        composite: true,
        skipLibCheck: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowSyntheticDefaultImports: true
      },
      include: ['vite.config.ts', 'vitest.config.ts', 'rollup.config.ts']
    }

    await fs.writeJSON(path.join(projectPath, 'tsconfig.node.json'), nodeConfig, { spaces: 2 })
  }

  /**
   * 生成ESLint配置
   */
  private async generateEslintConfig(projectPath: string, config: ProjectConfig): Promise<void> {
    if (!config.features.includes('eslint')) return

    const eslintConfig = {
      root: true,
      env: {
        browser: true,
        es2020: true,
        node: true
      },
      extends: [
        'eslint:recommended',
        ...(config.features.includes('typescript') ? ['@typescript-eslint/recommended'] : []),
        ...(config.type.includes('vue') ? ['plugin:vue/vue3-essential'] : []),
        ...(config.features.includes('prettier') ? ['prettier'] : [])
      ],
      ignorePatterns: ['dist', '.eslintrc.cjs'],
      parser: config.features.includes('typescript') ? '@typescript-eslint/parser' : undefined,
      plugins: [
        ...(config.features.includes('typescript') ? ['@typescript-eslint'] : []),
        ...(config.type.includes('vue') ? ['vue'] : [])
      ],
      rules: {
        'no-console': 'warn',
        'no-debugger': 'warn'
      }
    }

    await fs.writeJSON(path.join(projectPath, '.eslintrc.json'), eslintConfig, { spaces: 2 })
  }

  /**
   * 生成Prettier配置
   */
  private async generatePrettierConfig(projectPath: string, config: ProjectConfig): Promise<void> {
    if (!config.features.includes('prettier')) return

    const prettierConfig = {
      semi: false,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 100,
      endOfLine: 'lf'
    }

    await fs.writeJSON(path.join(projectPath, '.prettierrc'), prettierConfig, { spaces: 2 })

    const prettierIgnore = [
      'dist',
      'node_modules',
      '*.log',
      '.DS_Store',
      'coverage'
    ].join('\n')

    await fs.writeFile(path.join(projectPath, '.prettierignore'), prettierIgnore)
  }

  /**
   * 生成.gitignore
   */
  private async generateGitignore(projectPath: string, config: ProjectConfig): Promise<void> {
    const gitignore = [
      '# Dependencies',
      'node_modules/',
      '',
      '# Build outputs',
      'dist/',
      'build/',
      '.next/',
      '.nuxt/',
      '',
      '# Environment variables',
      '.env',
      '.env.local',
      '.env.*.local',
      '',
      '# IDE',
      '.vscode/',
      '.idea/',
      '*.swp',
      '*.swo',
      '',
      '# OS',
      '.DS_Store',
      'Thumbs.db',
      '',
      '# Logs',
      '*.log',
      'logs/',
      '',
      '# Coverage',
      'coverage/',
      '.nyc_output/',
      '',
      '# Cache',
      '.cache/',
      '.parcel-cache/',
      '.eslintcache',
      '',
      ...(config.features.includes('docker') ? ['# Docker', '.dockerignore', ''] : [])
    ].join('\n')

    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore)
  }

  /**
   * 生成Vite配置
   */
  private async generateViteConfig(projectPath: string, config: ProjectConfig): Promise<void> {
    if (config.buildTool !== 'vite') return

    let viteConfig = `import { defineConfig } from 'vite'\n`
    
    if (config.type.includes('vue')) {
      viteConfig += `import vue from '@vitejs/plugin-vue'\n`
    }
    
    viteConfig += `\nexport default defineConfig({\n`
    viteConfig += `  plugins: [`
    
    if (config.type.includes('vue')) {
      viteConfig += `vue()`
    }
    
    viteConfig += `],\n`
    
    if (config.type.includes('vue')) {
      viteConfig += `  resolve: {\n`
      viteConfig += `    alias: {\n`
      viteConfig += `      '@': path.resolve(__dirname, 'src')\n`
      viteConfig += `    }\n`
      viteConfig += `  }\n`
    }
    
    viteConfig += `})\n`

    await fs.writeFile(path.join(projectPath, 'vite.config.ts'), viteConfig)
  }

  /**
   * 生成Rollup配置
   */
  private async generateRollupConfig(projectPath: string, config: ProjectConfig): Promise<void> {
    if (config.buildTool !== 'rollup') return

    const rollupConfig = `import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
${config.type.includes('vue') ? "import vue from 'rollup-plugin-vue'\n" : ''}
export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named'
    },
    {
      file: 'dist/index.esm.js',
      format: 'es'
    }
  ],
  plugins: [
    ${config.type.includes('vue') ? 'vue(),\n    ' : ''}resolve(),
    commonjs(),
    typescript({
      declaration: true,
      outDir: 'dist'
    })
  ],
  external: ['vue']
})
`

    await fs.writeFile(path.join(projectPath, 'rollup.config.ts'), rollupConfig)
  }

  /**
   * 生成tsup配置
   */
  private async generateTsupConfig(projectPath: string, config: ProjectConfig): Promise<void> {
    if (config.buildTool !== 'tsup') return

    const tsupConfig = `import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false
})
`

    await fs.writeFile(path.join(projectPath, 'tsup.config.ts'), tsupConfig)
  }

  /**
   * 生成Vitest配置
   */
  private async generateVitestConfig(projectPath: string, config: ProjectConfig): Promise<void> {
    if (!config.features.includes('vitest')) return

    const vitestConfig = `import { defineConfig } from 'vitest/config'
${config.type.includes('vue') ? "import vue from '@vitejs/plugin-vue'\n" : ''}
export default defineConfig({
  ${config.type.includes('vue') ? 'plugins: [vue()],\n  ' : ''}test: {
    globals: true,
    environment: '${config.type.includes('vue') ? 'happy-dom' : 'node'}'
  }
})
`

    await fs.writeFile(path.join(projectPath, 'vitest.config.ts'), vitestConfig)
  }

  /**
   * 生成Docker配置
   */
  private async generateDockerConfig(projectPath: string, config: ProjectConfig): Promise<void> {
    if (!config.features.includes('docker')) return

    const dockerfile = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

${config.buildTool === 'vite' ? 'RUN npm run build\n' : ''}
EXPOSE 3000

CMD ["npm", "start"]
`

    await fs.writeFile(path.join(projectPath, 'Dockerfile'), dockerfile)

    const dockerCompose = `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
`

    await fs.writeFile(path.join(projectPath, 'docker-compose.yml'), dockerCompose)
  }

  /**
   * 生成Nginx配置
   */
  private async generateNginxConfig(projectPath: string, config: ProjectConfig): Promise<void> {
    if (!config.features.includes('nginx')) return

    const nginxConfig = `server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`

    await fs.ensureDir(path.join(projectPath, 'nginx'))
    await fs.writeFile(path.join(projectPath, 'nginx', 'default.conf'), nginxConfig)
  }

  /**
   * 生成GitHub Actions
   */
  private async generateGithubActions(projectPath: string, config: ProjectConfig): Promise<void> {
    if (!config.features.includes('github-actions')) return

    const workflow = `name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: '${config.packageManager}'
    
    - name: Install dependencies
      run: ${config.packageManager} install
    
    - name: Run tests
      run: ${config.packageManager} run test
    
    - name: Build
      run: ${config.packageManager} run build
`

    await fs.ensureDir(path.join(projectPath, '.github', 'workflows'))
    await fs.writeFile(path.join(projectPath, '.github', 'workflows', 'ci.yml'), workflow)
  }
}