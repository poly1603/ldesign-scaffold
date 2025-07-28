export { ScaffoldGenerator } from './core/ScaffoldGenerator.js'
export { TemplateManager } from './core/TemplateManager.js'
export { ConfigGenerator } from './core/ConfigGenerator.js'
export { UIServer } from './ui/UIServer.js'
export { GitManager } from './commands/GitManager.js'
export { DockerManager } from './commands/DockerManager.js'
export { NginxManager } from './commands/NginxManager.js'
export { SubmoduleManager } from './commands/SubmoduleManager.js'
export { WorkflowManager } from './commands/WorkflowManager.js'
export { IconManager } from './commands/IconManager.js'
export { FontManager } from './commands/FontManager.js'

export * from './types/index.js'
export * from './utils/index.js'

// 默认导出脚手架生成器
import { ScaffoldGenerator } from './core/ScaffoldGenerator.js'
export default ScaffoldGenerator