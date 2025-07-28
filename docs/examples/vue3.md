# Vue 3 示例项目

这是一个使用 LDesign Scaffold 创建的 Vue 3 示例项目，展示了现代 Vue.js 开发的最佳实践。

## 项目特性

- **Vue 3** - 最新的 Vue.js 框架
- **Composition API** - 现代的组件编写方式
- **TypeScript** - 类型安全的开发体验
- **Vite** - 快速的开发和构建工具
- **单文件组件** - .vue 文件支持
- **响应式设计** - 移动端友好

## 快速开始

```bash
# 进入项目目录
cd examples/vue3-example

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

访问 http://localhost:3000 查看项目。

## 项目结构

```
vue3-example/
├── src/
│   ├── components/
│   │   ├── HelloWorld.vue    # 欢迎组件
│   │   └── TheWelcome.vue    # 功能展示组件
│   ├── assets/
│   │   └── vue.svg           # Vue 图标
│   ├── App.vue               # 根组件
│   ├── main.ts               # 应用入口
│   └── style.css             # 全局样式
├── public/                   # 静态资源
├── index.html                # HTML 模板
├── vite.config.ts            # Vite 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 项目配置
```

## 核心代码解析

### 应用入口 (main.ts)

```typescript
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
```

### 根组件 (App.vue)

```vue
<template>
  <div id="app">
    <header>
      <img alt="Vue logo" src="./assets/vue.svg" width="125" height="125" />
      <div class="wrapper">
        <HelloWorld msg="Vue 3 + TypeScript + Vite" />
      </div>
    </header>

    <main>
      <TheWelcome />
    </main>
  </div>
</template>

<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
</script>
```

### 组件示例 (HelloWorld.vue)

```vue
<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      你已经成功创建了一个使用 ldesign-scaffold 脚手架的 Vue 3 项目！
    </h3>
    <p>
      计数器: <button type="button" @click="count++">{{ count }}</button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  msg: string
}>()

const count = ref(0)
</script>
```

## 开发特性

### Composition API

项目使用 Vue 3 的 Composition API，提供更好的逻辑复用和类型推导：

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const count = ref(0)
const message = ref('Hello Vue 3!')

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 生命周期钩子
onMounted(() => {
  console.log('组件已挂载')
})

// 方法
const increment = () => {
  count.value++
}
</script>
```

### TypeScript 支持

完整的 TypeScript 支持，包括：

- 组件 Props 类型定义
- 事件类型检查
- 模板类型推导
- IDE 智能提示

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}

interface Emits {
  (e: 'update', value: number): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const emit = defineEmits<Emits>()
</script>
```

### 样式方案

支持多种样式编写方式：

```vue
<style scoped>
/* 作用域样式 */
.component {
  color: #2c3e50;
}
</style>

<style module>
/* CSS Modules */
.title {
  font-size: 2rem;
}
</style>

<style lang="scss">
/* Sass 预处理器 */
$primary-color: #42b883;

.button {
  background-color: $primary-color;
  
  &:hover {
    opacity: 0.8;
  }
}
</style>
```

## 构建配置

### Vite 配置 (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### TypeScript 配置 (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

## 可用命令

```bash
# 开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 预览构建结果
pnpm run preview

# 类型检查
pnpm run type-check

# 代码检查
pnpm run lint

# 代码格式化
pnpm run format

# 单元测试
pnpm run test

# 测试覆盖率
pnpm run test:coverage
```

## 扩展功能

### 路由 (Vue Router)

```bash
# 安装 Vue Router
pnpm add vue-router@4

# 配置路由
# src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: () => import('../views/About.vue') }
  ]
})

export default router
```

### 状态管理 (Pinia)

```bash
# 安装 Pinia
pnpm add pinia

# 创建 store
# src/stores/counter.ts
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
})
```

### UI 组件库

```bash
# Element Plus
pnpm add element-plus

# Ant Design Vue
pnpm add ant-design-vue

# Naive UI
pnpm add naive-ui
```

## 部署

### 构建生产版本

```bash
pnpm run build
```

### 静态部署

构建后的文件在 `dist/` 目录，可以部署到任何静态服务器。

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm run build
EXPOSE 3000
CMD ["pnpm", "run", "preview"]
```

## 最佳实践

1. **组件设计** - 保持组件单一职责
2. **类型安全** - 充分利用 TypeScript
3. **性能优化** - 使用 v-memo 和异步组件
4. **代码规范** - 遵循 Vue 官方风格指南
5. **测试覆盖** - 编写单元测试和组件测试

## 相关链接

- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vue 3 最佳实践](https://vuejs.org/guide/best-practices/)
