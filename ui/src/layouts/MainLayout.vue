<template>
  <div class="layout-container">
    <!-- Sidebar -->
    <aside class="layout-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo" @click="$router.push('/')">
          <el-icon class="logo-icon"><Rocket /></el-icon>
          <span v-show="!sidebarCollapsed" class="logo-text">LDesign</span>
        </div>
        <el-button
          text
          class="collapse-btn"
          @click="toggleSidebar"
        >
          <el-icon><Fold v-if="!sidebarCollapsed" /><Expand v-else /></el-icon>
        </el-button>
      </div>
      
      <nav class="sidebar-nav">
        <el-menu
          :default-active="$route.path"
          :collapse="sidebarCollapsed"
          :unique-opened="true"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>{{ $t('nav.dashboard') }}</span>
          </el-menu-item>
          
          <el-menu-item index="/projects">
            <el-icon><Folder /></el-icon>
            <span>{{ $t('nav.projects') }}</span>
          </el-menu-item>
          
          <el-menu-item index="/create">
            <el-icon><Plus /></el-icon>
            <span>{{ $t('nav.create') }}</span>
          </el-menu-item>
          
          <el-menu-item index="/tools">
            <el-icon><Tools /></el-icon>
            <span>{{ $t('nav.tools') }}</span>
          </el-menu-item>
          
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>{{ $t('nav.settings') }}</span>
          </el-menu-item>
        </el-menu>
      </nav>
    </aside>
    
    <!-- Main content -->
    <main class="layout-main">
      <!-- Header -->
      <header class="layout-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="item in breadcrumbs"
              :key="item.path"
              :to="item.path"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <!-- Connection status -->
          <div class="connection-status" :class="connectionStatus">
            <el-icon><Connection /></el-icon>
            <span v-show="!sidebarCollapsed">{{ connectionText }}</span>
          </div>
          
          <!-- Language switcher -->
          <el-dropdown @command="switchLanguage">
            <el-button text>
              <el-icon><Globe /></el-icon>
              <span v-show="!sidebarCollapsed">{{ currentLanguage }}</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
                <el-dropdown-item command="en-US">English</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <!-- Theme switcher -->
          <el-button text @click="() => toggleTheme()">
            <el-icon><Sunny v-if="isDark" /><Moon v-else /></el-icon>
          </el-button>
        </div>
      </header>
      
      <!-- Content -->
      <div class="layout-content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDark, useToggle } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { switchLocale } from '@/i18n'
import { useAppStore } from '@/stores/app'
import { useSocketStore } from '@/stores/socket'

const route = useRoute()
const { t, locale } = useI18n()
const appStore = useAppStore()
const socketStore = useSocketStore()

const isDark = useDark()
const toggleTheme = useToggle(isDark)

// Sidebar state
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
const toggleSidebar = () => appStore.toggleSidebar()

// Connection status
const connectionStatus = computed(() => {
  return socketStore.connected ? 'connected' : 'disconnected'
})

const connectionText = computed(() => {
  return socketStore.connected ? '已连接' : '未连接'
})

// Language
const currentLanguage = computed(() => {
  return locale.value === 'zh-CN' ? '中文' : 'English'
})

const switchLanguage = (lang: string) => {
  switchLocale(lang)
}

// Breadcrumbs
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map(item => ({
    path: item.path,
    title: t(item.meta?.title as string)
  }))
})
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
}

.layout-sidebar {
  width: 240px;
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.3s ease;
  
  &.collapsed {
    width: 64px;
  }
  
  .sidebar-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    
    .logo {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
      color: var(--el-color-primary);
      
      .logo-icon {
        font-size: 24px;
        margin-right: 8px;
      }
      
      .logo-text {
        transition: opacity 0.3s ease;
      }
    }
    
    .collapse-btn {
      padding: 8px;
    }
  }
  
  .sidebar-nav {
    height: calc(100vh - 60px);
    overflow-y: auto;
    
    .el-menu {
      border-right: none;
    }
  }
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-header {
  height: 60px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 100;
  
  .header-left {
    flex: 1;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .connection-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      
      &.connected {
        color: var(--el-color-success);
        background-color: var(--el-color-success-light-9);
      }
      
      &.disconnected {
        color: var(--el-color-danger);
        background-color: var(--el-color-danger-light-9);
      }
    }
  }
}

.layout-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: var(--el-bg-color-page);
}

// Responsive
@media (max-width: 768px) {
  .layout-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    
    &:not(.collapsed) {
      transform: translateX(0);
    }
  }
  
  .layout-main {
    width: 100%;
  }
  
  .layout-content {
    padding: 16px;
  }
}
</style>
