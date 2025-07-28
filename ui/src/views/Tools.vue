<template>
  <div class="tools">
    <div class="page-header">
      <h1 class="page-title">{{ $t('tools.title') }}</h1>
      <p class="page-subtitle">环境检测和工具配置</p>
    </div>

    <div class="tools-grid">
      <!-- Environment Check -->
      <div class="tool-card">
        <div class="card-header">
          <div class="tool-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="tool-info">
            <h3 class="tool-title">环境检测</h3>
            <p class="tool-description">检测开发环境和依赖工具</p>
          </div>
        </div>
        <div class="card-body">
          <div class="environment-status" :class="environmentStatus">
            <el-icon><CircleCheck v-if="environmentStatus === 'good'" /><Warning v-else /></el-icon>
            <span>{{ environmentStatus === 'good' ? '环境正常' : '发现问题' }}</span>
          </div>
          <div class="environment-checks">
            <div
              v-for="check in environmentChecks"
              :key="check.name"
              class="check-item"
              :class="check.status"
            >
              <el-icon>
                <CircleCheck v-if="check.status === 'pass'" />
                <CircleClose v-else-if="check.status === 'fail'" />
                <Warning v-else />
              </el-icon>
              <span class="check-name">{{ check.name }}</span>
              <span class="check-message">{{ check.message }}</span>
            </div>
          </div>
        </div>
        <div class="card-actions">
          <el-button @click="checkEnvironment" :loading="checking">
            <el-icon><Refresh /></el-icon>
            重新检测
          </el-button>
        </div>
      </div>

      <!-- Git Management -->
      <div class="tool-card">
        <div class="card-header">
          <div class="tool-icon">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="tool-info">
            <h3 class="tool-title">Git 管理</h3>
            <p class="tool-description">Git 配置和仓库管理</p>
          </div>
        </div>
        <div class="card-body">
          <el-form label-width="80px" size="small">
            <el-form-item label="用户名">
              <el-input v-model="gitConfig.name" placeholder="Git 用户名" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="gitConfig.email" placeholder="Git 邮箱" />
            </el-form-item>
          </el-form>
        </div>
        <div class="card-actions">
          <el-button @click="saveGitConfig">保存配置</el-button>
        </div>
      </div>

      <!-- Docker Configuration -->
      <div class="tool-card">
        <div class="card-header">
          <div class="tool-icon">
            <el-icon><Box /></el-icon>
          </div>
          <div class="tool-info">
            <h3 class="tool-title">Docker 配置</h3>
            <p class="tool-description">容器化部署配置</p>
          </div>
        </div>
        <div class="card-body">
          <el-form label-width="80px" size="small">
            <el-form-item label="基础镜像">
              <el-select v-model="dockerConfig.baseImage" placeholder="选择基础镜像">
                <el-option label="node:18-alpine" value="node:18-alpine" />
                <el-option label="node:20-alpine" value="node:20-alpine" />
                <el-option label="nginx:alpine" value="nginx:alpine" />
              </el-select>
            </el-form-item>
            <el-form-item label="端口">
              <el-input-number v-model="dockerConfig.port" :min="1000" :max="65535" />
            </el-form-item>
          </el-form>
        </div>
        <div class="card-actions">
          <el-button @click="generateDockerfile">生成 Dockerfile</el-button>
        </div>
      </div>

      <!-- Nginx Configuration -->
      <div class="tool-card">
        <div class="card-header">
          <div class="tool-icon">
            <el-icon><Server /></el-icon>
          </div>
          <div class="tool-info">
            <h3 class="tool-title">Nginx 配置</h3>
            <p class="tool-description">Web 服务器配置生成</p>
          </div>
        </div>
        <div class="card-body">
          <el-form label-width="80px" size="small">
            <el-form-item label="域名">
              <el-input v-model="nginxConfig.domain" placeholder="example.com" />
            </el-form-item>
            <el-form-item label="端口">
              <el-input-number v-model="nginxConfig.port" :min="80" :max="65535" />
            </el-form-item>
            <el-form-item label="SSL">
              <el-switch v-model="nginxConfig.ssl" />
            </el-form-item>
          </el-form>
        </div>
        <div class="card-actions">
          <el-button @click="generateNginxConfig">生成配置</el-button>
        </div>
      </div>

      <!-- Font Management -->
      <div class="tool-card">
        <div class="card-header">
          <div class="tool-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="tool-info">
            <h3 class="tool-title">字体管理</h3>
            <p class="tool-description">字体压缩和子集化</p>
          </div>
        </div>
        <div class="card-body">
          <div class="font-info">
            <p>支持中文字体压缩和子集化</p>
            <p>减少字体文件大小，提升加载速度</p>
          </div>
        </div>
        <div class="card-actions">
          <el-button @click="openFontTool">打开工具</el-button>
        </div>
      </div>

      <!-- Icon Management -->
      <div class="tool-card">
        <div class="card-header">
          <div class="tool-icon">
            <el-icon><Picture /></el-icon>
          </div>
          <div class="tool-info">
            <h3 class="tool-title">图标管理</h3>
            <p class="tool-description">SVG 图标和图标字体生成</p>
          </div>
        </div>
        <div class="card-body">
          <div class="icon-info">
            <p>将 SVG 图标转换为图标字体</p>
            <p>生成 Vue/React 组件</p>
          </div>
        </div>
        <div class="card-actions">
          <el-button @click="openIconTool">打开工具</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// State
const checking = ref(false)
const environmentStatus = ref<'good' | 'issues'>('good')
const environmentChecks = ref([
  { name: 'Node.js', status: 'pass', message: 'v20.10.0' },
  { name: 'npm', status: 'pass', message: 'v10.2.3' },
  { name: 'pnpm', status: 'pass', message: 'v8.15.1' },
  { name: 'Git', status: 'pass', message: 'v2.42.0' },
  { name: 'Docker', status: 'warning', message: '未安装' }
])

const gitConfig = ref({
  name: '',
  email: ''
})

const dockerConfig = ref({
  baseImage: 'node:18-alpine',
  port: 3000
})

const nginxConfig = ref({
  domain: '',
  port: 80,
  ssl: false
})

// Methods
const checkEnvironment = async () => {
  checking.value = true
  
  try {
    // Simulate environment check
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update status based on checks
    const hasIssues = environmentChecks.value.some(check => check.status === 'fail')
    environmentStatus.value = hasIssues ? 'issues' : 'good'
    
    ElMessage.success('环境检测完成')
  } catch (error) {
    ElMessage.error('环境检测失败')
  } finally {
    checking.value = false
  }
}

const saveGitConfig = () => {
  if (!gitConfig.value.name || !gitConfig.value.email) {
    ElMessage.warning('请填写完整的 Git 配置信息')
    return
  }
  
  // Save git config
  localStorage.setItem('gitConfig', JSON.stringify(gitConfig.value))
  ElMessage.success('Git 配置保存成功')
}

const generateDockerfile = () => {
  const dockerfile = `FROM ${dockerConfig.value.baseImage}

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE ${dockerConfig.value.port}

CMD ["npm", "start"]`

  // Create and download file
  const blob = new Blob([dockerfile], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Dockerfile'
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('Dockerfile 生成成功')
}

const generateNginxConfig = () => {
  if (!nginxConfig.value.domain) {
    ElMessage.warning('请输入域名')
    return
  }
  
  const config = `server {
    listen ${nginxConfig.value.port}${nginxConfig.value.ssl ? ' ssl' : ''};
    server_name ${nginxConfig.value.domain};
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    ${nginxConfig.value.ssl ? `
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ` : ''}
}`

  // Create and download file
  const blob = new Blob([config], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'nginx.conf'
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('Nginx 配置生成成功')
}

const openFontTool = () => {
  ElMessage.info('字体管理工具开发中')
}

const openIconTool = () => {
  ElMessage.info('图标管理工具开发中')
}

// Initialize
onMounted(() => {
  // Load saved git config
  const saved = localStorage.getItem('gitConfig')
  if (saved) {
    gitConfig.value = JSON.parse(saved)
  }
})
</script>

<style lang="scss" scoped>
.tools {
  .page-header {
    margin-bottom: 32px;
    
    .page-title {
      font-size: 28px;
      font-weight: bold;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }
    
    .page-subtitle {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
  
  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
    
    .tool-card {
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-light);
      border-radius: 12px;
      padding: 24px;
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        
        .tool-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-right: 16px;
        }
        
        .tool-info {
          .tool-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            margin-bottom: 4px;
          }
          
          .tool-description {
            font-size: 14px;
            color: var(--el-text-color-secondary);
          }
        }
      }
      
      .card-body {
        margin-bottom: 20px;
        
        .environment-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          padding: 8px 12px;
          border-radius: 6px;
          font-weight: 500;
          
          &.good {
            background: var(--el-color-success-light-9);
            color: var(--el-color-success);
          }
          
          &.issues {
            background: var(--el-color-warning-light-9);
            color: var(--el-color-warning);
          }
        }
        
        .environment-checks {
          .check-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 0;
            font-size: 14px;
            
            &.pass {
              color: var(--el-color-success);
            }
            
            &.fail {
              color: var(--el-color-danger);
            }
            
            &.warning {
              color: var(--el-color-warning);
            }
            
            .check-name {
              min-width: 80px;
              font-weight: 500;
            }
            
            .check-message {
              color: var(--el-text-color-secondary);
            }
          }
        }
        
        .font-info,
        .icon-info {
          p {
            margin-bottom: 8px;
            font-size: 14px;
            color: var(--el-text-color-secondary);
            
            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
      
      .card-actions {
        display: flex;
        gap: 12px;
      }
    }
  }
}

@media (max-width: 768px) {
  .tools {
    .tools-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
