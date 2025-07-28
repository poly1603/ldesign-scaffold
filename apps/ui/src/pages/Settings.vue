<template>
  <div class="settings-page">
    <div class="settings-header">
      <h1 class="text-2xl font-bold text-gray-900">设置</h1>
      <p class="text-gray-600 mt-2">配置您的开发环境和偏好设置</p>
    </div>

    <div class="settings-content mt-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 通用设置 -->
        <div class="settings-section">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">通用设置</h2>
          <div class="space-y-4">
            <div class="setting-item">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                主题
              </label>
              <select v-model="settings.theme" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="light">浅色</option>
                <option value="dark">深色</option>
                <option value="auto">跟随系统</option>
              </select>
            </div>
            
            <div class="setting-item">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                语言
              </label>
              <select v-model="settings.language" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="zh-CN">中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 开发设置 -->
        <div class="settings-section">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">开发设置</h2>
          <div class="space-y-4">
            <div class="setting-item">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                默认端口
              </label>
              <input 
                v-model="settings.defaultPort" 
                type="number" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="3000"
              />
            </div>
            
            <div class="setting-item">
              <label class="flex items-center">
                <input 
                  v-model="settings.autoSave" 
                  type="checkbox" 
                  class="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="text-sm font-medium text-gray-700">自动保存</span>
              </label>
            </div>
            
            <div class="setting-item">
              <label class="flex items-center">
                <input 
                  v-model="settings.hotReload" 
                  type="checkbox" 
                  class="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="text-sm font-medium text-gray-700">热重载</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="mt-8 flex justify-end">
        <button 
          @click="saveSettings"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          保存设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Settings {
  theme: 'light' | 'dark' | 'auto'
  language: 'zh-CN' | 'en-US'
  defaultPort: number
  autoSave: boolean
  hotReload: boolean
}

const settings = ref<Settings>({
  theme: 'light',
  language: 'zh-CN',
  defaultPort: 3000,
  autoSave: true,
  hotReload: true
})

const loadSettings = () => {
  const savedSettings = localStorage.getItem('ldesign-settings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings)
      settings.value = { ...settings.value, ...parsed }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }
}

const saveSettings = () => {
  try {
    localStorage.setItem('ldesign-settings', JSON.stringify(settings.value))
    // 这里可以添加成功提示
    console.log('设置已保存')
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-page {
  @apply max-w-4xl mx-auto p-6;
}

.settings-section {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
}

.setting-item {
  @apply space-y-2;
}
</style>