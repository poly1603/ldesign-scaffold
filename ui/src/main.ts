import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

// Global styles
import './styles/index.scss'

// NProgress styles
import 'nprogress/nprogress.css'

const app = createApp(App)

// Install plugins
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(i18n)

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err, info)
  // You can send error to monitoring service here
}

// Mount app
app.mount('#app')

// Hide loading screen
const loading = document.getElementById('loading')
if (loading) {
  setTimeout(() => {
    loading.style.opacity = '0'
    setTimeout(() => {
      loading.remove()
    }, 300)
  }, 1000)
}
