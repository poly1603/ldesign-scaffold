<template>
  <div class="settings">
    <div class="page-header">
      <h1 class="page-title">{{ $t('settings.title') }}</h1>
      <p class="page-subtitle">配置系统设置和个人偏好</p>
    </div>

    <div class="settings-content">
      <el-tabs v-model="activeTab" tab-position="left">
        <!-- General Settings -->
        <el-tab-pane label="通用设置" name="general">
          <div class="settings-section">
            <h3 class="section-title">通用设置</h3>
            
            <el-form label-width="120px">
              <el-form-item label="默认作者">
                <el-input v-model="settings.defaultAuthor" placeholder="请输入默认作者" />
              </el-form-item>
              
              <el-form-item label="默认许可证">
                <el-select v-model="settings.defaultLicense">
                  <el-option label="MIT" value="MIT" />
                  <el-option label="Apache-2.0" value="Apache-2.0" />
                  <el-option label="GPL-3.0" value="GPL-3.0" />
                  <el-option label="BSD-3-Clause" value="BSD-3-Clause" />
                  <el-option label="ISC" value="ISC" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="默认包管理器">
                <el-select v-model="settings.defaultPackageManager">
                  <el-option label="pnpm" value="pnpm" />
                  <el-option label="npm" value="npm" />
                  <el-option label="yarn" value="yarn" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="项目存储路径">
                <el-input v-model="settings.projectsPath" placeholder="项目存储路径">
                  <template #append>
                    <el-button @click="selectProjectsPath">选择</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- Appearance Settings -->
        <el-tab-pane label="外观设置" name="appearance">
          <div class="settings-section">
            <h3 class="section-title">外观设置</h3>
            
            <el-form label-width="120px">
              <el-form-item label="主题模式">
                <el-radio-group v-model="themeMode" @change="onThemeChange">
                  <el-radio value="light">浅色模式</el-radio>
                  <el-radio value="dark">深色模式</el-radio>
                  <el-radio value="auto">跟随系统</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="语言设置">
                <el-select v-model="language" @change="onLanguageChange">
                  <el-option label="中文" value="zh-CN" />
                  <el-option label="English" value="en-US" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="侧边栏">
                <el-switch
                  v-model="sidebarCollapsed"
                  active-text="折叠"
                  inactive-text="展开"
                  @change="onSidebarChange"
                />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- Advanced Settings -->
        <el-tab-pane label="高级设置" name="advanced">
          <div class="settings-section">
            <h3 class="section-title">高级设置</h3>
            
            <el-form label-width="120px">
              <el-form-item label="自动安装依赖">
                <el-switch v-model="settings.autoInstall" />
              </el-form-item>
              
              <el-form-item label="启用 Git 钩子">
                <el-switch v-model="settings.enableGitHooks" />
              </el-form-item>
              
              <el-form-item label="检查更新">
                <el-switch v-model="settings.checkUpdates" />
              </el-form-item>
              
              <el-form-item label="发送使用统计">
                <el-switch v-model="settings.sendAnalytics" />
                <div class="form-help">
                  帮助我们改进产品，不会收集敏感信息
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- About -->
        <el-tab-pane label="关于" name="about">
          <div class="settings-section">
            <div class="about-content">
              <div class="app-info">
                <div class="app-logo">
                  <el-icon size="64"><Rocket /></el-icon>
                </div>
                <h2 class="app-name">LDesign Scaffold</h2>
                <p class="app-version">版本 1.0.0</p>
                <p class="app-description">现代化的前端项目脚手架工具</p>
              </div>
              
              <div class="app-details">
                <div class="detail-item">
                  <span class="detail-label">作者：</span>
                  <span class="detail-value">LDesign Team</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">许可证：</span>
                  <span class="detail-value">MIT</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">代码仓库：</span>
                  <el-link href="https://github.com/ldesign/ldesign-scaffold" target="_blank">
                    GitHub
                  </el-link>
                </div>
                <div class="detail-item">
                  <span class="detail-label">文档：</span>
                  <el-link href="https://ldesign.github.io/ldesign-scaffold" target="_blank">
                    在线文档
                  </el-link>
                </div>
              </div>
              
              <div class="app-actions">
                <el-button @click="checkForUpdates">检查更新</el-button>
                <el-button @click="openLogs">查看日志</el-button>
                <el-button @click="resetSettings">重置设置</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Save Actions -->
    <div class="settings-actions">
      <el-button @click="resetForm">重置</el-button>
      <el-button type="primary" @click="saveSettings">保存设置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { switchLocale } from '@/i18n'
import { useAppStore } from '@/stores/app'

const { locale } = useI18n()
const appStore = useAppStore()

// State
const activeTab = ref('general')

const settings = ref({
  defaultAuthor: '',
  defaultLicense: 'MIT',
  defaultPackageManager: 'pnpm',
  projectsPath: '',
  autoInstall: true,
  enableGitHooks: true,
  checkUpdates: true,
  sendAnalytics: false
})

// Computed
const themeMode = computed({
  get: () => appStore.theme,
  set: (value) => appStore.setTheme(value)
})

const language = computed({
  get: () => locale.value,
  set: (value) => switchLocale(value)
})

const sidebarCollapsed = computed({
  get: () => appStore.sidebarCollapsed,
  set: (value) => appStore.setSidebarCollapsed(value)
})

// Methods
const onThemeChange = (value: string) => {
  appStore.setTheme(value as 'light' | 'dark')
  ElMessage.success('主题设置已更新')
}

const onLanguageChange = (value: string) => {
  switchLocale(value)
  ElMessage.success('语言设置已更新')
}

const onSidebarChange = (value: boolean) => {
  appStore.setSidebarCollapsed(value)
}

const selectProjectsPath = () => {
  ElMessage.info('文件选择功能开发中')
}

const checkForUpdates = () => {
  ElMessage.info('检查更新功能开发中')
}

const openLogs = () => {
  ElMessage.info('日志查看功能开发中')
}

const resetSettings = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有设置吗？此操作不可撤销。',
      '重置设置',
      {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // Reset to defaults
    settings.value = {
      defaultAuthor: '',
      defaultLicense: 'MIT',
      defaultPackageManager: 'pnpm',
      projectsPath: '',
      autoInstall: true,
      enableGitHooks: true,
      checkUpdates: true,
      sendAnalytics: false
    }
    
    ElMessage.success('设置已重置')
  } catch (error) {
    // User cancelled
  }
}

const resetForm = () => {
  // Load settings from storage
  const stored = localStorage.getItem('appSettings')
  if (stored) {
    settings.value = { ...settings.value, ...JSON.parse(stored) }
  }
}

const saveSettings = () => {
  // Save to localStorage
  localStorage.setItem('appSettings', JSON.stringify(settings.value))
  ElMessage.success('设置保存成功')
}

// Initialize
onMounted(() => {
  resetForm()
})
</script>

<style lang="scss" scoped>
.settings {
  max-width: 1000px;
  margin: 0 auto;
  
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
  
  .settings-content {
    background: var(--el-bg-color);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    
    .settings-section {
      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 20px;
      }
      
      .form-help {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-top: 4px;
      }
    }
    
    .about-content {
      text-align: center;
      
      .app-info {
        margin-bottom: 32px;
        
        .app-logo {
          color: var(--el-color-primary);
          margin-bottom: 16px;
        }
        
        .app-name {
          font-size: 24px;
          font-weight: bold;
          color: var(--el-text-color-primary);
          margin-bottom: 8px;
        }
        
        .app-version {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          margin-bottom: 8px;
        }
        
        .app-description {
          font-size: 16px;
          color: var(--el-text-color-regular);
        }
      }
      
      .app-details {
        text-align: left;
        max-width: 400px;
        margin: 0 auto 32px;
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--el-border-color-lighter);
          
          &:last-child {
            border-bottom: none;
          }
          
          .detail-label {
            color: var(--el-text-color-secondary);
          }
          
          .detail-value {
            color: var(--el-text-color-primary);
          }
        }
      }
      
      .app-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
    }
  }
  
  .settings-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .settings {
    .settings-content {
      padding: 16px;
      
      :deep(.el-tabs--left) {
        .el-tabs__header {
          width: 100px;
        }
        
        .el-tabs__content {
          padding-left: 20px;
        }
      }
    }
  }
}
</style>
