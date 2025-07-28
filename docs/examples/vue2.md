# Vue 2 示例项目

这是一个使用 LDesign Scaffold 创建的 Vue 2 示例项目，展示了 Vue 2.7 的现代开发方式。

## 项目特性

- **Vue 2.7** - 最新的 Vue 2 版本，支持 Composition API
- **TypeScript** - 类型安全的开发体验
- **Vite** - 快速的开发和构建工具
- **向前兼容** - 支持渐进式升级到 Vue 3
- **现代工具链** - ESLint、Prettier 等开发工具

## 快速开始

```bash
# 进入项目目录
cd examples/vue2-example

# 启动开发服务器
pnpm run dev
```

访问 http://localhost:3000 查看项目。

## 项目结构

```
vue2-example/
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
import Vue from 'vue'
import './style.css'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
```

### 根组件 (App.vue)

```vue
<template>
  <div id="app">
    <header>
      <img alt="Vue logo" src="./assets/vue.svg" width="125" height="125" />
      <div class="wrapper">
        <HelloWorld msg="Vue 2.7 + TypeScript + Vite" />
      </div>
    </header>

    <main>
      <TheWelcome />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'

export default defineComponent({
  name: 'App',
  components: {
    HelloWorld,
    TheWelcome
  }
})
</script>
```

### 组件示例 (HelloWorld.vue)

```vue
<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      你已经成功创建了一个使用 ldesign-scaffold 脚手架的 Vue 2.7 项目！
    </h3>
    <p>
      计数器: <button type="button" @click="increment">{{ count }}</button>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: {
      type: String,
      required: true
    }
  },
  setup() {
    const count = ref(0)
    
    const increment = () => {
      count.value++
    }
    
    return {
      count,
      increment
    }
  }
})
</script>
```

## Vue 2.7 特性

### Composition API 支持

Vue 2.7 内置了 Composition API，无需额外安装：

```vue
<template>
  <div>
    <h2>{{ title }}</h2>
    <p>计数: {{ count }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'

export default defineComponent({
  setup() {
    // 响应式数据
    const count = ref(0)
    const title = ref('Vue 2.7 Composition API')
    
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
    
    return {
      title,
      count,
      doubleCount,
      increment
    }
  }
})
</script>
```

### 选项式 API

仍然支持传统的选项式 API：

```vue
<template>
  <div>
    <h2>{{ title }}</h2>
    <p>计数: {{ count }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      count: 0,
      title: 'Vue 2.7 选项式 API'
    }
  },
  computed: {
    doubleCount(): number {
      return this.count * 2
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    console.log('组件已挂载')
  }
})
</script>
```

## TypeScript 支持

### 组件类型定义

```vue
<script lang="ts">
import { defineComponent, PropType } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

export default defineComponent({
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    },
    count: {
      type: Number,
      default: 0
    }
  },
  emits: {
    'update-count': (value: number) => typeof value === 'number',
    'user-click': (user: User) => user && typeof user.id === 'number'
  },
  setup(props, { emit }) {
    const handleClick = () => {
      emit('user-click', props.user)
      emit('update-count', props.count + 1)
    }
    
    return {
      handleClick
    }
  }
})
</script>
```

### 全局类型声明

```typescript
// src/types/global.d.ts
declare global {
  interface Window {
    __VUE_DEVTOOLS_GLOBAL_HOOK__: any
  }
}

// Vue 组件类型扩展
declare module 'vue/types/vue' {
  interface Vue {
    $customProperty: string
  }
}

export {}
```

## 构建配置

### Vite 配置 (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'

export default defineConfig({
  plugins: [
    createVuePlugin({
      jsx: true,
      jsxOptions: {
        injectH: false
      }
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2015'
  },
  resolve: {
    alias: {
      '@': '/src'
    }
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
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 升级路径

### 渐进式升级到 Vue 3

1. **使用 Composition API**
   - 逐步将选项式 API 组件改写为 Composition API
   - 利用 Vue 2.7 的兼容性进行平滑过渡

2. **更新依赖**
   - 检查第三方库的 Vue 3 兼容性
   - 逐步更新到 Vue 3 兼容版本

3. **迁移工具**
   ```bash
   # 使用 Vue 3 迁移助手
   npm install -g @vue/compat-migration-helper
   vue-compat-migration-helper
   ```

### 兼容性注意事项

- **过滤器** - Vue 3 中已移除，需要改为计算属性或方法
- **全局 API** - 部分全局 API 在 Vue 3 中有变化
- **事件 API** - `$on`、`$off`、`$once` 在 Vue 3 中已移除

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
```

## 扩展功能

### 路由 (Vue Router 3)

```bash
# 安装 Vue Router 3
pnpm add vue-router@3

# 配置路由
# src/router/index.ts
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: () => import('../views/About.vue') }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
```

### 状态管理 (Vuex 3)

```bash
# 安装 Vuex 3
pnpm add vuex@3

# 创建 store
# src/store/index.ts
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  actions: {
    increment({ commit }) {
      commit('increment')
    }
  }
})
```

## 最佳实践

1. **组件设计** - 保持组件单一职责
2. **类型安全** - 充分利用 TypeScript
3. **渐进升级** - 为 Vue 3 升级做准备
4. **代码规范** - 遵循 Vue 2 风格指南
5. **性能优化** - 合理使用 v-memo 和函数式组件

## 相关链接

- [Vue 2.7 发布说明](https://blog.vuejs.org/posts/vue-2-7-naruto.html)
- [Vue 2 官方文档](https://v2.vuejs.org/)
- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)
- [Vite Vue 2 插件](https://github.com/underfin/vite-plugin-vue2)
