<template>
  <div class="welcome">
    <h2>欢迎使用 ldesign-scaffold!</h2>
    <p>这是一个使用 ldesign-scaffold 脚手架创建的 Vue 2 示例项目。</p>
    
    <div class="features">
      <div class="feature">
        <h3>🚀 快速开发</h3>
        <p>使用 Vite 提供的快速热重载和构建能力</p>
      </div>
      
      <div class="feature">
        <h3>📦 开箱即用</h3>
        <p>预配置了 TypeScript、ESLint、Prettier 等开发工具</p>
      </div>
      
      <div class="feature">
        <h3>🔧 灵活配置</h3>
        <p>支持多种项目类型和特性组合</p>
      </div>
    </div>
    
    <div class="commands">
      <h3>可用命令:</h3>
      <ul>
        <li><code>pnpm run dev</code> - 启动开发服务器</li>
        <li><code>pnpm run build</code> - 构建生产版本</li>
        <li><code>pnpm run preview</code> - 预览构建结果</li>
        <li><code>pnpm run lint</code> - 代码检查</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'TheWelcome'
})
</script>

<style scoped>
.welcome {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.feature {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.feature h3 {
  margin-top: 0;
  color: #2d3748;
}

.commands {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 8px;
}

.commands ul {
  list-style: none;
  padding: 0;
}

.commands li {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #4299e1;
}

code {
  background: #e2e8f0;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

@media (prefers-color-scheme: dark) {
  .feature {
    background: #2d3748;
    border-color: #4a5568;
  }
  
  .feature h3 {
    color: #e2e8f0;
  }
  
  .commands {
    background: #2d3748;
  }
  
  .commands li {
    background: #4a5568;
    border-left-color: #63b3ed;
  }
  
  code {
    background: #4a5568;
    color: #e2e8f0;
  }
}
</style>
