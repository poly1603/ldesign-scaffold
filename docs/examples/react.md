# React 示例项目

这是一个使用 LDesign Scaffold 创建的 React 示例项目，展示了现代 React 开发的最佳实践。

## 项目特性

- **React 18** - 最新的 React 版本，支持并发特性
- **TypeScript** - 类型安全的开发体验
- **Vite** - 快速的开发和构建工具
- **React Hooks** - 现代函数式组件开发
- **现代工具链** - ESLint、Prettier 等开发工具

## 快速开始

```bash
# 进入项目目录
cd examples/react-example

# 启动开发服务器
pnpm run dev
```

访问 http://localhost:3000 查看项目。

## 项目结构

```
react-example/
├── src/
│   ├── components/
│   │   ├── Counter.tsx       # 计数器组件
│   │   ├── UserCard.tsx      # 用户卡片组件
│   │   └── TodoList.tsx      # 待办事项组件
│   ├── hooks/
│   │   ├── useCounter.ts     # 计数器 Hook
│   │   └── useLocalStorage.ts # 本地存储 Hook
│   ├── types/
│   │   └── index.ts          # 类型定义
│   ├── utils/
│   │   └── helpers.ts        # 工具函数
│   ├── App.tsx               # 根组件
│   ├── main.tsx              # 应用入口
│   └── index.css             # 全局样式
├── public/                   # 静态资源
├── index.html                # HTML 模板
├── vite.config.ts            # Vite 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 项目配置
```

## 核心代码解析

### 应用入口 (main.tsx)

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 根组件 (App.tsx)

```tsx
import React, { useState } from 'react'
import Counter from './components/Counter'
import UserCard from './components/UserCard'
import TodoList from './components/TodoList'
import type { User } from './types'

const App: React.FC = () => {
  const [user] = useState<User>({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://via.placeholder.com/100'
  })

  return (
    <div className="app">
      <header className="app-header">
        <h1>React 18 + TypeScript + Vite</h1>
        <p>使用 ldesign-scaffold 创建的现代 React 应用</p>
      </header>

      <main className="app-main">
        <section className="demo-section">
          <h2>计数器示例</h2>
          <Counter initialValue={0} />
        </section>

        <section className="demo-section">
          <h2>用户信息</h2>
          <UserCard user={user} />
        </section>

        <section className="demo-section">
          <h2>待办事项</h2>
          <TodoList />
        </section>
      </main>
    </div>
  )
}

export default App
```

### 计数器组件 (Counter.tsx)

```tsx
import React from 'react'
import { useCounter } from '../hooks/useCounter'

interface CounterProps {
  initialValue?: number
  step?: number
}

const Counter: React.FC<CounterProps> = ({ 
  initialValue = 0, 
  step = 1 
}) => {
  const { count, increment, decrement, reset } = useCounter(initialValue, step)

  return (
    <div className="counter">
      <div className="counter-display">
        <span className="counter-value">{count}</span>
      </div>
      
      <div className="counter-controls">
        <button onClick={decrement} className="btn btn-secondary">
          -
        </button>
        <button onClick={reset} className="btn btn-outline">
          重置
        </button>
        <button onClick={increment} className="btn btn-primary">
          +
        </button>
      </div>
    </div>
  )
}

export default Counter
```

## React Hooks 示例

### 自定义 Hook - useCounter

```tsx
// src/hooks/useCounter.ts
import { useState, useCallback } from 'react'

interface UseCounterReturn {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
  setValue: (value: number) => void
}

export const useCounter = (
  initialValue: number = 0,
  step: number = 1
): UseCounterReturn => {
  const [count, setCount] = useState(initialValue)

  const increment = useCallback(() => {
    setCount(prev => prev + step)
  }, [step])

  const decrement = useCallback(() => {
    setCount(prev => prev - step)
  }, [step])

  const reset = useCallback(() => {
    setCount(initialValue)
  }, [initialValue])

  const setValue = useCallback((value: number) => {
    setCount(value)
  }, [])

  return {
    count,
    increment,
    decrement,
    reset,
    setValue
  }
}
```

### 自定义 Hook - useLocalStorage

```tsx
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // 从 localStorage 读取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // 更新 localStorage 的函数
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}
```

## TypeScript 类型定义

### 基础类型 (types/index.ts)

```typescript
// 用户类型
export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  createdAt?: Date
}

// 待办事项类型
export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  updatedAt?: Date
}

// API 响应类型
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

// 组件 Props 类型
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// 事件处理器类型
export type EventHandler<T = HTMLElement> = (event: React.MouseEvent<T>) => void
export type ChangeHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void

// 状态类型
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// 主题类型
export type Theme = 'light' | 'dark'
export type Size = 'small' | 'medium' | 'large'
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'error'
```

## 组件示例

### 用户卡片组件

```tsx
// src/components/UserCard.tsx
import React from 'react'
import type { User } from '../types'

interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
  onDelete?: (userId: number) => void
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  const handleEdit = () => {
    onEdit?.(user)
  }

  const handleDelete = () => {
    onDelete?.(user.id)
  }

  return (
    <div className="user-card">
      <div className="user-avatar">
        <img src={user.avatar} alt={user.name} />
      </div>
      
      <div className="user-info">
        <h3 className="user-name">{user.name}</h3>
        <p className="user-email">{user.email}</p>
        
        {user.createdAt && (
          <p className="user-created">
            加入时间: {user.createdAt.toLocaleDateString()}
          </p>
        )}
      </div>
      
      <div className="user-actions">
        {onEdit && (
          <button onClick={handleEdit} className="btn btn-outline">
            编辑
          </button>
        )}
        {onDelete && (
          <button onClick={handleDelete} className="btn btn-danger">
            删除
          </button>
        )}
      </div>
    </div>
  )
}

export default UserCard
```

### 待办事项组件

```tsx
// src/components/TodoList.tsx
import React, { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Todo } from '../types'

const TodoList: React.FC = () => {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [])
  const [inputValue, setInputValue] = useState('')

  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date()
      }
      
      setTodos(prev => [...prev, newTodo])
      setInputValue('')
    }
  }

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
          : todo
      )
    )
  }

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }

  return (
    <div className="todo-list">
      <div className="todo-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="添加新的待办事项..."
          className="input"
        />
        <button onClick={addTodo} className="btn btn-primary">
          添加
        </button>
      </div>

      <div className="todo-items">
        {todos.length === 0 ? (
          <p className="empty-state">暂无待办事项</p>
        ) : (
          todos.map(todo => (
            <div
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="todo-checkbox"
              />
              <span className="todo-text">{todo.text}</span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="btn btn-danger btn-small"
              >
                删除
              </button>
            </div>
          ))
        )}
      </div>

      {todos.length > 0 && (
        <div className="todo-stats">
          <p>
            总计: {todos.length} | 
            已完成: {todos.filter(t => t.completed).length} | 
            未完成: {todos.filter(t => !t.completed).length}
          </p>
        </div>
      )}
    </div>
  )
}

export default TodoList
```

## 构建配置

### Vite 配置 (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
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
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
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
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## React 18 特性

### 并发特性

```tsx
import React, { Suspense, lazy } from 'react'

// 懒加载组件
const LazyComponent = lazy(() => import('./LazyComponent'))

const App: React.FC = () => {
  return (
    <div>
      <Suspense fallback={<div>加载中...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  )
}
```

### 自动批处理

```tsx
import React, { useState } from 'react'

const BatchingExample: React.FC = () => {
  const [count, setCount] = useState(0)
  const [flag, setFlag] = useState(false)

  const handleClick = () => {
    // React 18 会自动批处理这些更新
    setCount(c => c + 1)
    setFlag(f => !f)
    // 只会触发一次重新渲染
  }

  return (
    <div>
      <button onClick={handleClick}>
        Count: {count}, Flag: {flag.toString()}
      </button>
    </div>
  )
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
```

## 扩展功能

### 路由 (React Router)

```bash
# 安装 React Router
pnpm add react-router-dom
pnpm add -D @types/react-router-dom
```

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### 状态管理 (Zustand)

```bash
# 安装 Zustand
pnpm add zustand
```

```tsx
// src/store/useStore.ts
import { create } from 'zustand'

interface AppState {
  count: number
  increment: () => void
  decrement: () => void
}

export const useStore = create<AppState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))
```

## 最佳实践

1. **组件设计** - 保持组件单一职责
2. **类型安全** - 充分利用 TypeScript
3. **性能优化** - 合理使用 React.memo 和 useMemo
4. **代码分割** - 使用 lazy 和 Suspense
5. **错误边界** - 处理组件错误

## 相关链接

- [React 18 官方文档](https://react.dev/)
- [React TypeScript 备忘单](https://react-typescript-cheatsheet.netlify.app/)
- [Vite React 插件](https://github.com/vitejs/vite-plugin-react)
- [React Hooks 文档](https://react.dev/reference/react)
