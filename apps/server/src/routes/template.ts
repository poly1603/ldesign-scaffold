import { Router, Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { config } from '../config';

const router = Router();

// 获取所有模板
router.get('/',
  asyncHandler(async (_req: Request, res: Response) => {
    const templates = await getAvailableTemplates();
    
    res.json({
      success: true,
      data: {
        templates,
        count: templates.length,
      },
    });
  })
);

// 获取模板详情
router.get('/:name',
  asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;
    
    const template = await getTemplateDetails(name);
    if (!template) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: `Template '${name}' not found`,
        },
      });
    }
    
    res.json({
      success: true,
      data: template,
    });
  })
);

// 获取模板文件结构
router.get('/:name/structure',
  asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;
    
    const templatePath = path.join(config.paths.templates, name);
    if (!(await fs.pathExists(templatePath))) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: `Template '${name}' not found`,
        },
      });
    }
    
    const structure = await getDirectoryStructure(templatePath);
    
    res.json({
      success: true,
      data: {
        name,
        structure,
      },
    });
  })
);

// 获取模板文件内容
router.get('/:name/files/*',
  asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;
    const filePath = req.params[0]; // 获取通配符部分
    
    const templatePath = path.join(config.paths.templates, name);
    const fullFilePath = path.join(templatePath, filePath);
    
    // 安全检查：确保文件在模板目录内
    if (!fullFilePath.startsWith(templatePath)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access to file outside template directory is denied',
        },
      });
    }
    
    if (!(await fs.pathExists(fullFilePath))) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: `File '${filePath}' not found in template '${name}'`,
        },
      });
    }
    
    const stats = await fs.stat(fullFilePath);
    if (stats.isDirectory()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'IS_DIRECTORY',
          message: `'${filePath}' is a directory, not a file`,
        },
      });
    }
    
    // 检查文件大小
    if (stats.size > 1024 * 1024) { // 1MB
      return res.status(413).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File is too large to display',
        },
      });
    }
    
    try {
      const content = await fs.readFile(fullFilePath, 'utf8');
      const ext = path.extname(filePath).toLowerCase();
      
      res.json({
        success: true,
        data: {
          path: filePath,
          content,
          size: stats.size,
          type: getFileType(ext),
          encoding: 'utf8',
        },
      });
    } catch (error) {
      // 如果不是文本文件，返回文件信息
      res.json({
        success: true,
        data: {
          path: filePath,
          content: null,
          size: stats.size,
          type: 'binary',
          encoding: 'binary',
          message: 'Binary file content not displayed',
        },
      });
    }
  })
);

// 创建自定义模板
router.post('/',
  asyncHandler(async (req: Request, res: Response) => {
    const { name, description, files, config: templateConfig } = req.body;
    
    if (!name || !files) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Template name and files are required',
        },
      });
    }
    
    // 验证模板名称
    if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TEMPLATE_NAME',
          message: 'Template name can only contain letters, numbers, hyphens, and underscores',
        },
      });
    }
    
    const templatePath = path.join(config.paths.templates, name);
    
    // 检查模板是否已存在
    if (await fs.pathExists(templatePath)) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'TEMPLATE_EXISTS',
          message: `Template '${name}' already exists`,
        },
      });
    }
    
    try {
      // 创建模板目录
      await fs.ensureDir(templatePath);
      
      // 创建文件
      for (const file of files) {
        const filePath = path.join(templatePath, file.path);
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, file.content, 'utf8');
      }
      
      // 创建模板配置文件
      const templateMeta = {
        name,
        description: description || '',
        version: '1.0.0',
        author: 'Custom',
        createdAt: new Date().toISOString(),
        config: templateConfig || {},
        files: files.map((f: any) => ({
          path: f.path,
          type: getFileType(path.extname(f.path)),
        })),
      };
      
      await fs.writeJson(path.join(templatePath, 'template.json'), templateMeta, { spaces: 2 });
      
      logger.info(`Custom template created: ${name}`);
      
      res.status(201).json({
        success: true,
        data: templateMeta,
        message: 'Template created successfully',
      });
    } catch (error) {
      // 清理失败的模板
      await fs.remove(templatePath).catch(() => {});
      throw error;
    }
  })
);

// 更新模板
router.put('/:name',
  asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;
    const { description, config: templateConfig } = req.body;
    
    const templatePath = path.join(config.paths.templates, name);
    const metaPath = path.join(templatePath, 'template.json');
    
    if (!(await fs.pathExists(metaPath))) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: `Template '${name}' not found`,
        },
      });
    }
    
    const templateMeta = await fs.readJson(metaPath);
    
    // 更新元数据
    if (description !== undefined) {
      templateMeta.description = description;
    }
    if (templateConfig !== undefined) {
      templateMeta.config = { ...templateMeta.config, ...templateConfig };
    }
    
    templateMeta.updatedAt = new Date().toISOString();
    
    await fs.writeJson(metaPath, templateMeta, { spaces: 2 });
    
    logger.info(`Template updated: ${name}`);
    
    res.json({
      success: true,
      data: templateMeta,
      message: 'Template updated successfully',
    });
  })
);

// 删除模板
router.delete('/:name',
  asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;
    
    // 不允许删除内置模板
    const builtinTemplates = ['vue3-basic', 'vue3-component-lib', 'vue2-component-lib', 'react-component-lib', 'nodejs-api'];
    if (builtinTemplates.includes(name)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'BUILTIN_TEMPLATE',
          message: 'Cannot delete built-in template',
        },
      });
    }
    
    const templatePath = path.join(config.paths.templates, name);
    
    if (!(await fs.pathExists(templatePath))) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: `Template '${name}' not found`,
        },
      });
    }
    
    await fs.remove(templatePath);
    
    logger.info(`Template deleted: ${name}`);
    
    res.json({
      success: true,
      message: 'Template deleted successfully',
    });
  })
);

// 导出模板
router.get('/:name/export',
  asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;
    
    const templatePath = path.join(config.paths.templates, name);
    if (!(await fs.pathExists(templatePath))) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: `Template '${name}' not found`,
        },
      });
    }
    
    const filename = `${name}-template-${new Date().toISOString().split('T')[0]}.zip`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/zip');
    
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });
    
    archive.pipe(res);
    
    // 添加模板文件到压缩包
    archive.directory(templatePath, name);
    
    await archive.finalize();
    
    logger.info(`Template exported: ${name}`);
  })
);

// 导入模板
router.post('/import',
  asyncHandler(async (_req: Request, res: Response) => {
    // 这里应该处理文件上传
    // 由于没有配置multer，暂时返回错误
    res.status(501).json({
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Template import is not implemented yet',
      },
    });
  })
);

// 验证模板
router.post('/:name/validate',
  asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;
    
    const templatePath = path.join(config.paths.templates, name);
    if (!(await fs.pathExists(templatePath))) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: `Template '${name}' not found`,
        },
      });
    }
    
    const validation = await validateTemplate(templatePath);
    
    res.json({
      success: true,
      data: {
        name,
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
      },
    });
  })
);

// 辅助函数

// 获取可用模板列表
async function getAvailableTemplates(): Promise<any[]> {
  const templatesDir = config.paths.templates;
  
  try {
    await fs.ensureDir(templatesDir);
    const items = await fs.readdir(templatesDir);
    const templates = [];
    
    for (const item of items) {
      const itemPath = path.join(templatesDir, item);
      const stats = await fs.stat(itemPath);
      
      if (stats.isDirectory()) {
        const template = await getTemplateDetails(item);
        if (template) {
          templates.push(template);
        }
      }
    }
    
    return templates;
  } catch (error) {
    logger.error('Failed to get available templates:', error);
    return [];
  }
}

// 获取模板详情
async function getTemplateDetails(name: string): Promise<any | null> {
  const templatePath = path.join(config.paths.templates, name);
  const metaPath = path.join(templatePath, 'template.json');
  
  try {
    if (!(await fs.pathExists(templatePath))) {
      return null;
    }
    
    let templateMeta: any = {
      name,
      description: '',
      version: '1.0.0',
      author: 'Unknown',
      createdAt: new Date().toISOString(),
    };
    
    // 读取模板元数据
    if (await fs.pathExists(metaPath)) {
      const meta = await fs.readJson(metaPath);
      templateMeta = { ...templateMeta, ...meta };
    }
    
    // 获取文件统计
    const stats = await getTemplateStats(templatePath);
    templateMeta.stats = stats;
    
    // 检查是否有package.json
    const packageJsonPath = path.join(templatePath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      templateMeta.packageInfo = {
        dependencies: Object.keys(packageJson.dependencies || {}),
        devDependencies: Object.keys(packageJson.devDependencies || {}),
        scripts: Object.keys(packageJson.scripts || {}),
      };
    }
    
    return templateMeta;
  } catch (error) {
    logger.error(`Failed to get template details for ${name}:`, error);
    return null;
  }
}

// 获取目录结构
async function getDirectoryStructure(dirPath: string, maxDepth: number = 3, currentDepth: number = 0): Promise<any> {
  if (currentDepth >= maxDepth) {
    return { type: 'directory', name: path.basename(dirPath), children: [] };
  }
  
  try {
    const items = await fs.readdir(dirPath);
    const children = [];
    
    for (const item of items) {
      // 跳过隐藏文件和特定目录
      if (item.startsWith('.') || ['node_modules', 'dist', 'build'].includes(item)) {
        continue;
      }
      
      const itemPath = path.join(dirPath, item);
      const stats = await fs.stat(itemPath);
      
      if (stats.isDirectory()) {
        const subStructure = await getDirectoryStructure(itemPath, maxDepth, currentDepth + 1);
        children.push(subStructure);
      } else {
        children.push({
          type: 'file',
          name: item,
          size: stats.size,
          ext: path.extname(item),
        });
      }
    }
    
    return {
      type: 'directory',
      name: path.basename(dirPath),
      children: children.sort((a, b) => {
        // 目录排在前面
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      }),
    };
  } catch (error) {
    return {
      type: 'directory',
      name: path.basename(dirPath),
      children: [],
      error: 'Failed to read directory',
    };
  }
}

// 获取模板统计信息
async function getTemplateStats(templatePath: string): Promise<any> {
  let fileCount = 0;
  let totalSize = 0;
  const fileTypes: Record<string, number> = {};
  
  async function countFiles(dirPath: string): Promise<void> {
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        if (item.startsWith('.') || ['node_modules', 'dist', 'build'].includes(item)) {
          continue;
        }
        
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);
        
        if (stats.isDirectory()) {
          await countFiles(itemPath);
        } else {
          fileCount++;
          totalSize += stats.size;
          
          const ext = path.extname(item).toLowerCase();
          fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        }
      }
    } catch (error) {
      // 忽略错误
    }
  }
  
  await countFiles(templatePath);
  
  return {
    fileCount,
    totalSize,
    fileTypes,
  };
}

// 获取文件类型
function getFileType(ext: string): string {
  const typeMap: Record<string, string> = {
    '.js': 'javascript',
    '.ts': 'typescript',
    '.jsx': 'javascript',
    '.tsx': 'typescript',
    '.vue': 'vue',
    '.html': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.sass': 'sass',
    '.less': 'less',
    '.json': 'json',
    '.md': 'markdown',
    '.txt': 'text',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.xml': 'xml',
    '.svg': 'svg',
    '.png': 'image',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.gif': 'image',
    '.ico': 'image',
  };
  
  return typeMap[ext.toLowerCase()] || 'unknown';
}

// 验证模板
async function validateTemplate(templatePath: string): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // 检查必需文件
    const packageJsonPath = path.join(templatePath, 'package.json');
    if (!(await fs.pathExists(packageJsonPath))) {
      errors.push('Missing package.json file');
    } else {
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        if (!packageJson.name) {
          errors.push('package.json missing name field');
        }
        if (!packageJson.scripts) {
          warnings.push('package.json missing scripts field');
        }
      } catch (error) {
        errors.push('Invalid package.json format');
      }
    }
    
    // 检查模板配置文件
    const templateJsonPath = path.join(templatePath, 'template.json');
    if (await fs.pathExists(templateJsonPath)) {
      try {
        await fs.readJson(templateJsonPath);
      } catch (error) {
        errors.push('Invalid template.json format');
      }
    }
    
    // 检查是否有源代码文件
    const srcPath = path.join(templatePath, 'src');
    if (!(await fs.pathExists(srcPath))) {
      warnings.push('No src directory found');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      valid: false,
      errors: ['Failed to validate template'],
      warnings: [],
    };
  }
}

export default router;