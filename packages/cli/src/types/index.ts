export interface ProjectTemplate {
  name: string;
  displayName: string;
  description: string;
  framework: 'vue2' | 'vue3' | 'react' | 'typescript' | 'less' | 'nodejs';
  buildTool: 'vite' | 'rollup' | 'tsup' | 'webpack';
  packageManager: 'npm' | 'yarn' | 'pnpm';
  features: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  templatePath: string;
}

export interface CreateOptions {
  template?: string;
  framework?: string;
  buildTool?: string;
  packageManager?: string;
  features?: string[];
  skipInstall?: boolean;
  force?: boolean;
}

export interface DevOptions {
  port?: number;
  host?: string;
  open?: boolean;
  https?: boolean;
}

export interface BuildOptions {
  mode?: 'development' | 'production';
  target?: string;
  outDir?: string;
  sourcemap?: boolean;
  minify?: boolean;
}

export interface DeployOptions {
  platform?: 'vercel' | 'netlify' | 'github-pages' | 'custom';
  buildDir?: string;
  config?: string;
  skipBuild?: boolean;
}

export interface UIOptions {
  port?: number;
  host?: string;
  open?: boolean;
}

export interface ProjectConfig {
  name: string;
  version: string;
  framework: string;
  buildTool: string;
  packageManager: string;
  features: string[];
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface TemplateContext {
  projectName: string;
  packageName: string;
  description: string;
  author: string;
  email: string;
  framework: string;
  buildTool: string;
  packageManager: string;
  features: string[];
  typescript: boolean;
  eslint: boolean;
  prettier: boolean;
  husky: boolean;
  commitlint: boolean;
}