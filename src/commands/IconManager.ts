import path from 'path'
import fs from 'fs-extra'
import { CommandResult } from '../types/index.js'
import { logger } from '../utils/index.js'

export interface IconFont {
  id: string
  name: string
  fontClass: string
  unicode: string
  fontFamily: string
}

export interface IconProject {
  id: string
  name: string
  description?: string
  fontClass: string
  icons: IconFont[]
  cssUrl?: string
  jsUrl?: string
  downloadUrl?: string
}

export class IconManager {
  /**
   * 列出项目中的图标
   */
  async list(projectPath: string): Promise<CommandResult<IconFont[]>> {
    try {
      const iconsDir = path.join(projectPath, 'src', 'assets', 'icons')
      const iconConfigPath = path.join(iconsDir, 'iconfont.json')
      
      if (!await fs.pathExists(iconConfigPath)) {
        return {
          success: true,
          message: '没有找到图标配置',
          data: []
        }
      }
      
      const config = await fs.readJson(iconConfigPath)
      const icons: IconFont[] = config.icons || []
      
      return {
        success: true,
        message: '获取图标列表成功',
        data: icons
      }
    } catch (error) {
      const message = `获取图标列表失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 下载 Iconfont 项目
   */
  async downloadIconfont(projectPath: string, projectId: string, fontClass?: string): Promise<CommandResult> {
    try {
      // 这里模拟下载过程，实际项目中需要调用 Iconfont API
      const iconsDir = path.join(projectPath, 'src', 'assets', 'icons')
      await fs.ensureDir(iconsDir)
      
      // 生成示例图标配置
      const iconProject: IconProject = {
        id: projectId,
        name: `Iconfont Project ${projectId}`,
        fontClass: fontClass || 'iconfont',
        icons: [
          {
            id: '1',
            name: 'home',
            fontClass: 'icon-home',
            unicode: '\\e001',
            fontFamily: fontClass || 'iconfont'
          },
          {
            id: '2',
            name: 'user',
            fontClass: 'icon-user',
            unicode: '\\e002',
            fontFamily: fontClass || 'iconfont'
          },
          {
            id: '3',
            name: 'setting',
            fontClass: 'icon-setting',
            unicode: '\\e003',
            fontFamily: fontClass || 'iconfont'
          }
        ],
        cssUrl: `//at.alicdn.com/t/font_${projectId}.css`,
        jsUrl: `//at.alicdn.com/t/font_${projectId}.js`
      }
      
      // 保存配置文件
      const configPath = path.join(iconsDir, 'iconfont.json')
      await fs.writeJson(configPath, iconProject, { spaces: 2 })
      
      // 生成 CSS 文件
      const cssContent = this.generateIconCSS(iconProject)
      const cssPath = path.join(iconsDir, 'iconfont.css')
      await fs.writeFile(cssPath, cssContent, 'utf8')
      
      // 生成 TypeScript 类型定义
      const typesContent = this.generateIconTypes(iconProject)
      const typesPath = path.join(iconsDir, 'iconfont.d.ts')
      await fs.writeFile(typesPath, typesContent, 'utf8')
      
      // 生成 Vue 组件（如果是 Vue 项目）
      const vueComponentPath = path.join(iconsDir, 'IconFont.vue')
      if (await this.isVueProject(projectPath)) {
        const vueComponent = this.generateVueIconComponent(iconProject)
        await fs.writeFile(vueComponentPath, vueComponent, 'utf8')
      }
      
      // 生成 React 组件（如果是 React 项目）
      const reactComponentPath = path.join(iconsDir, 'IconFont.tsx')
      if (await this.isReactProject(projectPath)) {
        const reactComponent = this.generateReactIconComponent(iconProject)
        await fs.writeFile(reactComponentPath, reactComponent, 'utf8')
      }
      
      logger.success(`Iconfont 项目下载成功: ${projectId}`)
      
      return {
        success: true,
        message: 'Iconfont 项目下载成功',
        data: {
          projectId,
          fontClass,
          iconsCount: iconProject.icons.length,
          files: {
            config: configPath,
            css: cssPath,
            types: typesPath,
            component: await this.isVueProject(projectPath) ? vueComponentPath : reactComponentPath
          }
        }
      }
    } catch (error) {
      const message = `下载 Iconfont 项目失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 更新图标项目
   */
  async updateIconfont(projectPath: string, projectId: string): Promise<CommandResult> {
    try {
      // 重新下载并更新
      return await this.downloadIconfont(projectPath, projectId)
    } catch (error) {
      const message = `更新 Iconfont 项目失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 添加自定义图标
   */
  async addCustomIcon(projectPath: string, icon: Omit<IconFont, 'id'>): Promise<CommandResult> {
    try {
      const iconsDir = path.join(projectPath, 'src', 'assets', 'icons')
      const configPath = path.join(iconsDir, 'iconfont.json')
      
      let config: IconProject
      
      if (await fs.pathExists(configPath)) {
        config = await fs.readJson(configPath)
      } else {
        config = {
          id: 'custom',
          name: 'Custom Icons',
          fontClass: 'iconfont',
          icons: []
        }
      }
      
      // 生成新的 ID
      const newId = (Math.max(...config.icons.map(i => parseInt(i.id) || 0), 0) + 1).toString()
      
      const newIcon: IconFont = {
        id: newId,
        ...icon
      }
      
      config.icons.push(newIcon)
      
      // 保存配置
      await fs.writeJson(configPath, config, { spaces: 2 })
      
      // 重新生成 CSS 和类型文件
      const cssContent = this.generateIconCSS(config)
      const cssPath = path.join(iconsDir, 'iconfont.css')
      await fs.writeFile(cssPath, cssContent, 'utf8')
      
      const typesContent = this.generateIconTypes(config)
      const typesPath = path.join(iconsDir, 'iconfont.d.ts')
      await fs.writeFile(typesPath, typesContent, 'utf8')
      
      logger.success(`自定义图标添加成功: ${icon.name}`)
      
      return {
        success: true,
        message: '自定义图标添加成功',
        data: newIcon
      }
    } catch (error) {
      const message = `添加自定义图标失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 删除图标
   */
  async removeIcon(projectPath: string, iconId: string): Promise<CommandResult> {
    try {
      const iconsDir = path.join(projectPath, 'src', 'assets', 'icons')
      const configPath = path.join(iconsDir, 'iconfont.json')
      
      if (!await fs.pathExists(configPath)) {
        return {
          success: false,
          message: '图标配置文件不存在',
          error: new Error('图标配置文件不存在')
        }
      }
      
      const config: IconProject = await fs.readJson(configPath)
      const iconIndex = config.icons.findIndex(icon => icon.id === iconId)
      
      if (iconIndex === -1) {
        return {
          success: false,
          message: `图标不存在: ${iconId}`,
          error: new Error(`图标不存在: ${iconId}`)
        }
      }
      
      const removedIcon = config.icons.splice(iconIndex, 1)[0]
      
      // 保存配置
      await fs.writeJson(configPath, config, { spaces: 2 })
      
      // 重新生成 CSS 和类型文件
      const cssContent = this.generateIconCSS(config)
      const cssPath = path.join(iconsDir, 'iconfont.css')
      await fs.writeFile(cssPath, cssContent, 'utf8')
      
      const typesContent = this.generateIconTypes(config)
      const typesPath = path.join(iconsDir, 'iconfont.d.ts')
      await fs.writeFile(typesPath, typesContent, 'utf8')
      
      logger.success(`图标删除成功: ${removedIcon.name}`)
      
      return {
        success: true,
        message: '图标删除成功',
        data: removedIcon
      }
    } catch (error) {
      const message = `删除图标失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 生成图标预览页面
   */
  async generatePreview(projectPath: string): Promise<CommandResult> {
    try {
      const iconsDir = path.join(projectPath, 'src', 'assets', 'icons')
      const configPath = path.join(iconsDir, 'iconfont.json')
      
      if (!await fs.pathExists(configPath)) {
        return {
          success: false,
          message: '图标配置文件不存在',
          error: new Error('图标配置文件不存在')
        }
      }
      
      const config: IconProject = await fs.readJson(configPath)
      const previewContent = this.generatePreviewHTML(config)
      const previewPath = path.join(iconsDir, 'preview.html')
      
      await fs.writeFile(previewPath, previewContent, 'utf8')
      
      logger.success(`图标预览页面生成成功: ${previewPath}`)
      
      return {
        success: true,
        message: '图标预览页面生成成功',
        data: { path: previewPath }
      }
    } catch (error) {
      const message = `生成图标预览页面失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 检查是否为 Vue 项目
   */
  private async isVueProject(projectPath: string): Promise<boolean> {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json')
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath)
        return !!(packageJson.dependencies?.vue || packageJson.devDependencies?.vue)
      }
      return false
    } catch {
      return false
    }
  }

  /**
   * 检查是否为 React 项目
   */
  private async isReactProject(projectPath: string): Promise<boolean> {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json')
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath)
        return !!(packageJson.dependencies?.react || packageJson.devDependencies?.react)
      }
      return false
    } catch {
      return false
    }
  }

  /**
   * 生成图标 CSS
   */
  private generateIconCSS(project: IconProject): string {
    const lines: string[] = []
    
    lines.push('/* Iconfont CSS */')
    lines.push('/* Generated by ldesign-scaffold */')
    lines.push('')
    
    // 基础样式
    lines.push(`@font-face {`)
    lines.push(`  font-family: '${project.fontClass}';`)
    if (project.cssUrl) {
      lines.push(`  src: url('${project.cssUrl}');`)
    }
    lines.push(`}`)
    lines.push('')
    
    lines.push(`.${project.fontClass} {`)
    lines.push(`  font-family: '${project.fontClass}' !important;`)
    lines.push(`  font-size: 16px;`)
    lines.push(`  font-style: normal;`)
    lines.push(`  -webkit-font-smoothing: antialiased;`)
    lines.push(`  -moz-osx-font-smoothing: grayscale;`)
    lines.push(`}`)
    lines.push('')
    
    // 图标样式
    project.icons.forEach(icon => {
      lines.push(`.${icon.fontClass}:before {`)
      lines.push(`  content: "${icon.unicode}";`)
      lines.push(`}`)
      lines.push('')
    })
    
    return lines.join('\n')
  }

  /**
   * 生成图标类型定义
   */
  private generateIconTypes(project: IconProject): string {
    const lines: string[] = []
    
    lines.push('// Iconfont Types')
    lines.push('// Generated by ldesign-scaffold')
    lines.push('')
    
    // 图标名称类型
    const iconNames = project.icons.map(icon => `'${icon.name}'`).join(' | ')
    lines.push(`export type IconName = ${iconNames || 'string'}`)
    lines.push('')
    
    // 图标类名类型
    const iconClasses = project.icons.map(icon => `'${icon.fontClass}'`).join(' | ')
    lines.push(`export type IconClass = ${iconClasses || 'string'}`)
    lines.push('')
    
    // 图标接口
    lines.push('export interface IconFont {')
    lines.push('  id: string')
    lines.push('  name: IconName')
    lines.push('  fontClass: IconClass')
    lines.push('  unicode: string')
    lines.push('  fontFamily: string')
    lines.push('}')
    lines.push('')
    
    // 图标项目接口
    lines.push('export interface IconProject {')
    lines.push('  id: string')
    lines.push('  name: string')
    lines.push('  description?: string')
    lines.push('  fontClass: string')
    lines.push('  icons: IconFont[]')
    lines.push('  cssUrl?: string')
    lines.push('  jsUrl?: string')
    lines.push('}')
    
    return lines.join('\n')
  }

  /**
   * 生成 Vue 图标组件
   */
  private generateVueIconComponent(project: IconProject): string {
    return `<template>
  <i :class="[fontClass, iconClass]" />
</template>

<script setup lang="ts">
import type { IconName } from './iconfont'

interface Props {
  name: IconName
  size?: string | number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: '16px',
  color: 'currentColor'
})

const fontClass = '${project.fontClass}'
const iconClass = computed(() => \`icon-\${props.name}\`)

const style = computed(() => ({
  fontSize: typeof props.size === 'number' ? \`\${props.size}px\` : props.size,
  color: props.color
}))
</script>

<style scoped>
@import './iconfont.css';
</style>
`
  }

  /**
   * 生成 React 图标组件
   */
  private generateReactIconComponent(project: IconProject): string {
    return `import React from 'react'
import type { IconName } from './iconfont'
import './iconfont.css'

export interface IconFontProps {
  name: IconName
  size?: string | number
  color?: string
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

export const IconFont: React.FC<IconFontProps> = ({
  name,
  size = '16px',
  color = 'currentColor',
  className = '',
  style = {},
  onClick
}) => {
  const iconStyle: React.CSSProperties = {
    fontSize: typeof size === 'number' ? \`\${size}px\` : size,
    color,
    ...style
  }

  return (
    <i
      className={\`${project.fontClass} icon-\${name} \${className}\`}
      style={iconStyle}
      onClick={onClick}
    />
  )
}

export default IconFont
`
  }

  /**
   * 生成预览 HTML
   */
  private generatePreviewHTML(project: IconProject): string {
    const iconItems = project.icons.map(icon => `
    <div class="icon-item">
      <i class="${project.fontClass} ${icon.fontClass}"></i>
      <div class="icon-name">${icon.name}</div>
      <div class="icon-class">${icon.fontClass}</div>
      <div class="icon-unicode">${icon.unicode}</div>
    </div>`).join('')

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name} - 图标预览</title>
  <link rel="stylesheet" href="./iconfont.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .header h1 {
      color: #333;
      margin-bottom: 10px;
    }
    .header p {
      color: #666;
      margin: 0;
    }
    .icons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .icon-item {
      background: white;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
    }
    .icon-item:hover {
      transform: translateY(-2px);
    }
    .icon-item i {
      font-size: 32px;
      color: #1890ff;
      margin-bottom: 10px;
      display: block;
    }
    .icon-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }
    .icon-class {
      font-size: 12px;
      color: #666;
      font-family: 'Monaco', 'Menlo', monospace;
      margin-bottom: 5px;
    }
    .icon-unicode {
      font-size: 12px;
      color: #999;
      font-family: 'Monaco', 'Menlo', monospace;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${project.name}</h1>
    <p>共 ${project.icons.length} 个图标</p>
  </div>
  <div class="icons-grid">${iconItems}
  </div>
</body>
</html>`
  }
}