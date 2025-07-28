<template>
  <div id="app" :class="{ 'dark': isDark }">
    <el-config-provider :locale="locale">
      <router-view />
    </el-config-provider>
    
    <!-- Global notification container -->
    <Teleport to="body">
      <div id="notification-container"></div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDark } from '@vueuse/core'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

const { locale: i18nLocale } = useI18n()
const isDark = useDark()

// Element Plus locale
const locale = computed(() => {
  return i18nLocale.value === 'zh-CN' ? zhCn : en
})

// Apply theme class to html element
watchEffect(() => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})
</script>

<style lang="scss">
// Import global styles
@import './styles/variables.scss';
@import './styles/mixins.scss';

#app {
  min-height: 100vh;
  background-color: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
  transition: all 0.3s ease;
}

// Dark mode styles
html.dark {
  color-scheme: dark;
}

// Custom scrollbar
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--el-fill-color-dark);
  border-radius: 4px;
  
  &:hover {
    background: var(--el-fill-color-darker);
  }
}

// NProgress custom styles
#nprogress {
  .bar {
    background: var(--el-color-primary) !important;
    height: 3px !important;
  }
  
  .peg {
    box-shadow: 0 0 10px var(--el-color-primary), 0 0 5px var(--el-color-primary) !important;
  }
  
  .spinner-icon {
    border-top-color: var(--el-color-primary) !important;
    border-left-color: var(--el-color-primary) !important;
  }
}

// Animation classes
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}
</style>
