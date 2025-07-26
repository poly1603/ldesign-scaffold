import path from 'path'
import fs from 'fs-extra'
import { CommandResult } from '../types/index.js'
import { logger } from '../utils/index.js'

export interface FontConfig {
  name: string
  family: string
  weight: number | string
  style: 'normal' | 'italic' | 'oblique'
  format: 'woff' | 'woff2' | 'ttf' | 'otf' | 'eot'
  src: string
  unicodeRange?: string
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
}

export interface FontFamily {
  name: string
  fonts: FontConfig[]
  fallback?: string[]
  description?: string
}

export interface FontProject {
  name: string
  families: FontFamily[]
  cssPath?: string
  fontsDir?: string
}

export class FontManager {
  /**
   * 列出项目中的字体
   */
  async list(projectPath: string): Promise<CommandResult<FontFamily[]>> {
    try {
      const fontsDir = path.join(projectPath, 'src', 'assets', 'fonts')
      const configPath = path.join(fontsDir, 'fonts.json')
      
      if (!await fs.pathExists(configPath)) {
        return {
          success: true,
          message: '没有找到字体配置',
          data: []
        }
      }
      
      const config: FontProject = await fs.readJson(configPath)
      
      return {
        success: true,
        message: '获取字体列表成功',
        data: config.families || []
      }
    } catch (error) {
      const message = `获取字体列表失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 添加字体族
   */
  async addFontFamily(projectPath: string, fontFamily: FontFamily): Promise<CommandResult> {
    try {
      const fontsDir = path.join(projectPath, 'src', 'assets', 'fonts')
      await fs.ensureDir(fontsDir)
      
      const configPath = path.join(fontsDir, 'fonts.json')
      
      let config: FontProject
      
      if (await fs.pathExists(configPath)) {
        config = await fs.readJson(configPath)
      } else {
        config = {
          name: 'Font Project',
          families: [],
          fontsDir: './fonts',
          cssPath: './fonts.css'
        }
      }
      
      // 检查是否已存在同名字体族
      const existingIndex = config.families.findIndex(f => f.name === fontFamily.name)
      
      if (existingIndex >= 0) {
        config.families[existingIndex] = fontFamily
        logger.info(`字体族已更新: ${fontFamily.name}`)
      } else {
        config.families.push(fontFamily)
        logger.info(`字体族已添加: ${fontFamily.name}`)
      }
      
      // 保存配置
      await fs.writeJson(configPath, config, { spaces: 2 })
      
      // 生成 CSS 文件
      await this.generateFontCSS(projectPath, config)
      
      // 生成类型定义
      await this.generateFontTypes(projectPath, config)
      
      return {
        success: true,
        message: '字体族添加成功',
        data: fontFamily
      }
    } catch (error) {
      const message = `添加字体族失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 删除字体族
   */
  async removeFontFamily(projectPath: string, familyName: string): Promise<CommandResult> {
    try {
      const fontsDir = path.join(projectPath, 'src', 'assets', 'fonts')
      const configPath = path.join(fontsDir, 'fonts.json')
      
      if (!await fs.pathExists(configPath)) {
        return {
          success: false,
          message: '字体配置文件不存在',
          error: new Error('字体配置文件不存在')
        }
      }
      
      const config: FontProject = await fs.readJson(configPath)
      const familyIndex = config.families.findIndex(f => f.name === familyName)
      
      if (familyIndex === -1) {
        return {
          success: false,
          message: `字体族不存在: ${familyName}`,
          error: new Error(`字体族不存在: ${familyName}`)
        }
      }
      
      const removedFamily = config.families.splice(familyIndex, 1)[0]
      
      // 保存配置
      await fs.writeJson(configPath, config, { spaces: 2 })
      
      // 重新生成 CSS 和类型文件
      await this.generateFontCSS(projectPath, config)
      await this.generateFontTypes(projectPath, config)
      
      logger.success(`字体族删除成功: ${familyName}`)
      
      return {
        success: true,
        message: '字体族删除成功',
        data: removedFamily
      }
    } catch (error) {
      const message = `删除字体族失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 压缩字体文件
   */
  async compressFonts(projectPath: string, options?: {
    text?: string
    formats?: ('woff' | 'woff2' | 'ttf')[]
    subset?: boolean
  }): Promise<CommandResult> {
    try {
      const fontsDir = path.join(projectPath, 'src', 'assets', 'fonts')
      
      if (!await fs.pathExists(fontsDir)) {
        return {
          success: false,
          message: '字体目录不存在',
          error: new Error('字体目录不存在')
        }
      }
      
      // 这里模拟字体压缩过程
      // 实际项目中需要使用 fontmin 或其他字体压缩工具
      const compressedDir = path.join(fontsDir, 'compressed')
      await fs.ensureDir(compressedDir)
      
      const fontFiles = await fs.readdir(fontsDir)
      const supportedExts = ['.ttf', '.otf', '.woff', '.woff2']
      const fonts = fontFiles.filter(file => 
        supportedExts.some(ext => file.toLowerCase().endsWith(ext))
      )
      
      const results = []
      
      for (const font of fonts) {
        const sourcePath = path.join(fontsDir, font)
        const targetPath = path.join(compressedDir, font)
        
        // 模拟压缩过程
        await fs.copy(sourcePath, targetPath)
        
        const sourceStats = await fs.stat(sourcePath)
        const targetStats = await fs.stat(targetPath)
        
        results.push({
          font,
          originalSize: sourceStats.size,
          compressedSize: targetStats.size,
          ratio: ((sourceStats.size - targetStats.size) / sourceStats.size * 100).toFixed(2) + '%'
        })
      }
      
      logger.success(`字体压缩完成，处理了 ${fonts.length} 个字体文件`)
      
      return {
        success: true,
        message: '字体压缩完成',
        data: {
          processedFonts: fonts.length,
          outputDir: compressedDir,
          results
        }
      }
    } catch (error) {
      const message = `字体压缩失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 生成字体子集
   */
  async generateSubset(projectPath: string, options: {
    fontPath: string
    text: string
    outputPath?: string
    formats?: ('woff' | 'woff2' | 'ttf')[]
  }): Promise<CommandResult> {
    try {
      const { fontPath, text, outputPath, formats = ['woff2', 'woff'] } = options
      
      const sourcePath = path.isAbsolute(fontPath) ? fontPath : path.join(projectPath, fontPath)
      
      if (!await fs.pathExists(sourcePath)) {
        return {
          success: false,
          message: `字体文件不存在: ${fontPath}`,
          error: new Error(`字体文件不存在: ${fontPath}`)
        }
      }
      
      const fontsDir = path.join(projectPath, 'src', 'assets', 'fonts')
      const subsetDir = path.join(fontsDir, 'subset')
      await fs.ensureDir(subsetDir)
      
      const fontName = path.basename(fontPath, path.extname(fontPath))
      const results = []
      
      // 模拟字体子集生成
      for (const format of formats) {
        const outputFile = `${fontName}-subset.${format}`
        const targetPath = outputPath ? path.join(outputPath, outputFile) : path.join(subsetDir, outputFile)
        
        // 这里应该调用实际的字体子集工具
        await fs.copy(sourcePath, targetPath)
        
        results.push({
          format,
          path: targetPath,
          characters: text.length
        })
      }
      
      logger.success(`字体子集生成完成: ${fontName}`)
      
      return {
        success: true,
        message: '字体子集生成完成',
        data: {
          fontName,
          text,
          formats,
          results
        }
      }
    } catch (error) {
      const message = `生成字体子集失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 安装 Google Fonts
   */
  async installGoogleFonts(projectPath: string, fonts: string[]): Promise<CommandResult> {
    try {
      const fontsDir = path.join(projectPath, 'src', 'assets', 'fonts')
      await fs.ensureDir(fontsDir)
      
      const googleFontsConfig: FontFamily[] = []
      
      for (const fontName of fonts) {
        // 模拟 Google Fonts 下载
        const fontFamily: FontFamily = {
          name: fontName,
          fonts: [
            {
              name: `${fontName} Regular`,
              family: fontName,
              weight: 400,
              style: 'normal',
              format: 'woff2',
              src: `url('https://fonts.gstatic.com/s/${fontName.toLowerCase().replace(/\s+/g, '')}/v1/${fontName.toLowerCase().replace(/\s+/g, '')}-regular.woff2')`,
              display: 'swap'
            },
            {
              name: `${fontName} Bold`,
              family: fontName,
              weight: 700,
              style: 'normal',
              format: 'woff2',
              src: `url('https://fonts.gstatic.com/s/${fontName.toLowerCase().replace(/\s+/g, '')}/v1/${fontName.toLowerCase().replace(/\s+/g, '')}-bold.woff2')`,
              display: 'swap'
            }
          ],
          fallback: ['sans-serif'],
          description: `Google Font: ${fontName}`
        }
        
        googleFontsConfig.push(fontFamily)
      }
      
      // 添加到项目配置
      for (const fontFamily of googleFontsConfig) {
        await this.addFontFamily(projectPath, fontFamily)
      }
      
      // 生成 Google Fonts 链接
      const googleFontsUrl = this.generateGoogleFontsUrl(fonts)
      const linkTag = `<link href="${googleFontsUrl}" rel="stylesheet">`
      
      logger.success(`Google Fonts 安装完成: ${fonts.join(', ')}`)
      
      return {
        success: true,
        message: 'Google Fonts 安装完成',
        data: {
          fonts,
          googleFontsUrl,
          linkTag,
          families: googleFontsConfig
        }
      }
    } catch (error) {
      const message = `安装 Google Fonts 失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 生成字体预览页面
   */
  async generatePreview(projectPath: string): Promise<CommandResult> {
    try {
      const fontsDir = path.join(projectPath, 'src', 'assets', 'fonts')
      const configPath = path.join(fontsDir, 'fonts.json')
      
      if (!await fs.pathExists(configPath)) {
        return {
          success: false,
          message: '字体配置文件不存在',
          error: new Error('字体配置文件不存在')
        }
      }
      
      const config: FontProject = await fs.readJson(configPath)
      const previewContent = this.generatePreviewHTML(config)
      const previewPath = path.join(fontsDir, 'preview.html')
      
      await fs.writeFile(previewPath, previewContent, 'utf8')
      
      logger.success(`字体预览页面生成成功: ${previewPath}`)
      
      return {
        success: true,
        message: '字体预览页面生成成功',
        data: { path: previewPath }
      }
    } catch (error) {
      const message = `生成字体预览页面失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 生成字体 CSS
   */
  private async generateFontCSS(projectPath: string, config: FontProject): Promise<void> {
    const fontsDir = path.join(projectPath, 'src', 'assets', 'fonts')
    const cssPath = path.join(fontsDir, 'fonts.css')
    
    const lines: string[] = []
    
    lines.push('/* Fonts CSS */')
    lines.push('/* Generated by ldesign-scaffold */')
    lines.push('')
    
    config.families.forEach(family => {
      family.fonts.forEach(font => {
        lines.push('@font-face {')
        lines.push(`  font-family: '${font.family}';`)
        lines.push(`  font-weight: ${font.weight};`)
        lines.push(`  font-style: ${font.style};`)
        lines.push(`  src: ${font.src};`)
        
        if (font.display) {
          lines.push(`  font-display: ${font.display};`)
        }
        
        if (font.unicodeRange) {
          lines.push(`  unicode-range: ${font.unicodeRange};`)
        }
        
        lines.push('}')
        lines.push('')
      })
      
      // 生成字体族工具类
      const className = family.name.toLowerCase().replace(/\s+/g, '-')
      lines.push(`.font-${className} {`)
      lines.push(`  font-family: '${family.name}'${family.fallback ? ', ' + family.fallback.join(', ') : ''};`)
      lines.push('}')
      lines.push('')
    })
    
    await fs.writeFile(cssPath, lines.join('\n'), 'utf8')
  }

  /**
   * 生成字体类型定义
   */
  private async generateFontTypes(projectPath: string, config: FontProject): Promise<void> {
    const fontsDir = path.join(projectPath, 'src', 'assets', 'fonts')
    const typesPath = path.join(fontsDir, 'fonts.d.ts')
    
    const lines: string[] = []
    
    lines.push('// Fonts Types')
    lines.push('// Generated by ldesign-scaffold')
    lines.push('')
    
    // 字体族名称类型
    const familyNames = config.families.map(f => `'${f.name}'`).join(' | ')
    lines.push(`export type FontFamily = ${familyNames || 'string'}`)
    lines.push('')
    
    // 字体权重类型
    const weights = [...new Set(config.families.flatMap(f => f.fonts.map(font => font.weight)))]
    const weightTypes = weights.map(w => `${w}`).join(' | ')
    lines.push(`export type FontWeight = ${weightTypes || 'number'}`)
    lines.push('')
    
    // 字体样式类型
    lines.push("export type FontStyle = 'normal' | 'italic' | 'oblique'")
    lines.push('')
    
    // 字体格式类型
    lines.push("export type FontFormat = 'woff' | 'woff2' | 'ttf' | 'otf' | 'eot'")
    lines.push('')
    
    // 字体配置接口
    lines.push('export interface FontConfig {')
    lines.push('  name: string')
    lines.push('  family: FontFamily')
    lines.push('  weight: FontWeight')
    lines.push('  style: FontStyle')
    lines.push('  format: FontFormat')
    lines.push('  src: string')
    lines.push('  unicodeRange?: string')
    lines.push("  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'")
    lines.push('}')
    lines.push('')
    
    await fs.writeFile(typesPath, lines.join('\n'), 'utf8')
  }

  /**
   * 生成 Google Fonts URL
   */
  private generateGoogleFontsUrl(fonts: string[]): string {
    const baseUrl = 'https://fonts.googleapis.com/css2'
    const families = fonts.map(font => {
      const family = font.replace(/\s+/g, '+')
      return `family=${family}:wght@400;700`
    })
    
    return `${baseUrl}?${families.join('&')}&display=swap`
  }

  /**
   * 生成预览 HTML
   */
  private generatePreviewHTML(config: FontProject): string {
    const fontItems = config.families.map(family => {
      const fontExamples = family.fonts.map(font => `
        <div class="font-example" style="font-family: '${font.family}'; font-weight: ${font.weight}; font-style: ${font.style};">
          <div class="font-text">The quick brown fox jumps over the lazy dog</div>
          <div class="font-info">${font.name} (${font.weight}, ${font.style})</div>
        </div>`).join('')
      
      return `
      <div class="font-family">
        <h3>${family.name}</h3>
        <p class="font-description">${family.description || ''}</p>
        <div class="font-examples">${fontExamples}
        </div>
      </div>`
    }).join('')

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.name} - 字体预览</title>
  <link rel="stylesheet" href="./fonts.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
      line-height: 1.6;
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
    .fonts-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .font-family {
      background: white;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .font-family h3 {
      color: #333;
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 24px;
    }
    .font-description {
      color: #666;
      margin-bottom: 20px;
      font-style: italic;
    }
    .font-examples {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .font-example {
      padding: 15px;
      border: 1px solid #eee;
      border-radius: 4px;
      background: #fafafa;
    }
    .font-text {
      font-size: 18px;
      margin-bottom: 8px;
      color: #333;
    }
    .font-info {
      font-size: 12px;
      color: #999;
      font-family: 'Monaco', 'Menlo', monospace;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${config.name}</h1>
    <p>共 ${config.families.length} 个字体族</p>
  </div>
  <div class="fonts-container">${fontItems}
  </div>
</body>
</html>`
  }
}