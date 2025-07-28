import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>React + TypeScript + Vite</h1>
      <h2>使用 ldesign-scaffold 脚手架创建</h2>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          计数器: {count}
        </button>
        <p>
          编辑 <code>src/App.tsx</code> 并保存以测试热重载功能。
        </p>
      </div>
      <div className="welcome">
        <h3>欢迎使用 ldesign-scaffold!</h3>
        <p>这是一个使用 ldesign-scaffold 脚手架创建的 React 示例项目。</p>
        
        <div className="features">
          <div className="feature">
            <h4>🚀 快速开发</h4>
            <p>使用 Vite 提供的快速热重载和构建能力</p>
          </div>
          
          <div className="feature">
            <h4>📦 开箱即用</h4>
            <p>预配置了 TypeScript、ESLint、Prettier 等开发工具</p>
          </div>
          
          <div className="feature">
            <h4>🔧 灵活配置</h4>
            <p>支持多种项目类型和特性组合</p>
          </div>
        </div>
        
        <div className="commands">
          <h4>可用命令:</h4>
          <ul>
            <li><code>pnpm run dev</code> - 启动开发服务器</li>
            <li><code>pnpm run build</code> - 构建生产版本</li>
            <li><code>pnpm run preview</code> - 预览构建结果</li>
            <li><code>pnpm run lint</code> - 代码检查</li>
          </ul>
        </div>
      </div>
      <p className="read-the-docs">
        点击 Vite 和 React 图标了解更多信息
      </p>
    </>
  )
}

export default App
