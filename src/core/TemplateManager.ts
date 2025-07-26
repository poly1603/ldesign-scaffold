import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { ProjectType, ProjectFeature, TemplateVariables } from '../types/index.js'
import { logger } from '../utils/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 模板管理器
 */
export class TemplateManager {
  private templatesDir: string

  constructor() {
    // 模板目录位于项目根目录的templates文件夹
    this.templatesDir = path.resolve(__dirname, '../../templates')
  }

  /**
   * 获取模板路径
   */
  async getTemplatePath(projectType: ProjectType): Promise<string | null> {
    const templatePath = path.join(this.templatesDir, projectType)
    
    if (await fs.pathExists(templatePath)) {
      return templatePath
    }
    
    logger.warning(`模板不存在: ${projectType}`)
    return null
  }

  /**
   * 获取特性模板路径
   */
  async getFeatureTemplatePath(feature: ProjectFeature): Promise<string | null> {
    const featurePath = path.join(this.templatesDir, 'features', feature)
    
    if (await fs.pathExists(featurePath)) {
      return featurePath
    }
    
    return null
  }

  /**
   * 列出所有可用模板
   */
  async listTemplates(): Promise<ProjectType[]> {
    try {
      if (!(await fs.pathExists(this.templatesDir))) {
        return []
      }
      
      const items = await fs.readdir(this.templatesDir)
      const templates: ProjectType[] = []
      
      for (const item of items) {
        const itemPath = path.join(this.templatesDir, item)
        const stat = await fs.stat(itemPath)
        
        if (stat.isDirectory() && item !== 'features') {
          templates.push(item as ProjectType)
        }
      }
      
      return templates
    } catch (error) {
      logger.error(`获取模板列表失败: ${error instanceof Error ? error.message : String(error)}`)
      return []
    }
  }

  /**
   * 列出所有可用特性
   */
  async listFeatures(): Promise<ProjectFeature[]> {
    try {
      const featuresDir = path.join(this.templatesDir, 'features')
      
      if (!(await fs.pathExists(featuresDir))) {
        return []
      }
      
      const items = await fs.readdir(featuresDir)
      const features: ProjectFeature[] = []
      
      for (const item of items) {
        const itemPath = path.join(featuresDir, item)
        const stat = await fs.stat(itemPath)
        
        if (stat.isDirectory()) {
          features.push(item as ProjectFeature)
        }
      }
      
      return features
    } catch (error) {
      logger.error(`获取特性列表失败: ${error instanceof Error ? error.message : String(error)}`)
      return []
    }
  }

  /**
   * 创建自定义模板
   */
  async createCustomTemplate(
    name: string,
    sourceDir: string,
    description?: string
  ): Promise<boolean> {
    try {
      const templatePath = path.join(this.templatesDir, 'custom', name)
      
      if (await fs.pathExists(templatePath)) {
        logger.warning(`模板已存在: ${name}`)
        return false
      }
      
      // 复制源目录到模板目录
      await fs.copy(sourceDir, templatePath)
      
      // 创建模板配置文件
      const config = {
        name,
        description: description || `Custom template: ${name}`,
        type: 'custom',
        createdAt: new Date().toISOString()
      }
      
      await fs.writeJSON(path.join(templatePath, 'template.json'), config, { spaces: 2 })
      
      logger.success(`自定义模板创建成功: ${name}`)
      return true
    } catch (error) {
      logger.error(`创建自定义模板失败: ${error instanceof Error ? error.message : String(error)}`)
      return false
    }
  }

  /**
   * 删除自定义模板
   */
  async removeCustomTemplate(name: string): Promise<boolean> {
    try {
      const templatePath = path.join(this.templatesDir, 'custom', name)
      
      if (!(await fs.pathExists(templatePath))) {
        logger.warning(`模板不存在: ${name}`)
        return false
      }
      
      await fs.remove(templatePath)
      logger.success(`自定义模板删除成功: ${name}`)
      return true
    } catch (error) {
      logger.error(`删除自定义模板失败: ${error instanceof Error ? error.message : String(error)}`)
      return false
    }
  }

  /**
   * 获取模板信息
   */
  async getTemplateInfo(projectType: ProjectType): Promise<any> {
    try {
      const templatePath = await this.getTemplatePath(projectType)
      if (!templatePath) {
        return null
      }
      
      const configPath = path.join(templatePath, 'template.json')
      
      if (await fs.pathExists(configPath)) {
        return await fs.readJSON(configPath)
      }
      
      // 返回默认信息
      return {
        name: projectType,
        description: `${projectType} template`,
        type: projectType
      }
    } catch (error) {
      logger.error(`获取模板信息失败: ${error instanceof Error ? error.message : String(error)}`)
      return null
    }
  }

  /**
   * 验证模板
   */
  async validateTemplate(templatePath: string): Promise<boolean> {
    try {
      // 检查模板目录是否存在
      if (!(await fs.pathExists(templatePath))) {
        return false
      }
      
      // 检查是否有package.json模板
      const packageJsonPath = path.join(templatePath, 'package.json.ejs')
      const packageJsonAltPath = path.join(templatePath, 'package.json')
      
      if (!(await fs.pathExists(packageJsonPath)) && !(await fs.pathExists(packageJsonAltPath))) {
        logger.warning(`模板缺少package.json: ${templatePath}`)
        return false
      }
      
      return true
    } catch (error) {
      logger.error(`验证模板失败: ${error instanceof Error ? error.message : String(error)}`)
      return false
    }
  }

  /**
   * 渲染模板变量
   */
  renderTemplate(content: string, variables: TemplateVariables): string {
    let rendered = content
    
    // 替换变量
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      rendered = rendered.replace(regex, String(value))
    })
    
    return rendered
  }

  /**
   * 获取模板依赖
   */
  async getTemplateDependencies(projectType: ProjectType): Promise<{
    dependencies: Record<string, string>
    devDependencies: Record<string, string>
  }> {
    const templatePath = await this.getTemplatePath(projectType)
    if (!templatePath) {
      return { dependencies: {}, devDependencies: {} }
    }
    
    try {
      const packageJsonPath = path.join(templatePath, 'package.json.ejs')
      const packageJsonAltPath = path.join(templatePath, 'package.json')
      
      let packageJsonContent = ''
      
      if (await fs.pathExists(packageJsonPath)) {
        packageJsonContent = await fs.readFile(packageJsonPath, 'utf8')
      } else if (await fs.pathExists(packageJsonAltPath)) {
        packageJsonContent = await fs.readFile(packageJsonAltPath, 'utf8')
      }
      
      if (packageJsonContent) {
        // 简单的变量替换，用于获取依赖信息
        const rendered = this.renderTemplate(packageJsonContent, {
          projectName: 'temp',
          projectDescription: 'temp',
          author: 'temp',
          version: '1.0.0',
          license: 'MIT'
        })
        
        const packageJson = JSON.parse(rendered)
        
        return {
          dependencies: packageJson.dependencies || {},
          devDependencies: packageJson.devDependencies || {}
        }
      }
    } catch (error) {
      logger.warning(`获取模板依赖失败: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    return { dependencies: {}, devDependencies: {} }
  }

  /**
   * 初始化模板目录
   */
  async initializeTemplates(): Promise<void> {
    try {
      await fs.ensureDir(this.templatesDir)
      await fs.ensureDir(path.join(this.templatesDir, 'features'))
      await fs.ensureDir(path.join(this.templatesDir, 'custom'))
      
      logger.info('模板目录初始化完成')
    } catch (error) {
      logger.error(`模板目录初始化失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 获取模板目录路径
   */
  getTemplatesDirectory(): string {
    return this.templatesDir
  }
}