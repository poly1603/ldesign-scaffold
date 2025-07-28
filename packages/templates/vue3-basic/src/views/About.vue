<template>
  <div class="about">
    <h1>关于我们</h1>
    <div class="content">
      <p>
        这是一个使用 LDesign 脚手架工具创建的 Vue 3 项目。
      </p>
      <p>
        LDesign 是一个现代化的前端开发脚手架工具，旨在帮助开发者快速创建高质量的前端项目。
      </p>
      
      <div class="tech-stack">
        <h2>技术栈</h2>
        <div class="tech-grid">
          <div class="tech-item">
            <h3>Vue 3</h3>
            <p>渐进式 JavaScript 框架</p>
          </div>
          <div class="tech-item">
            <h3>Vite</h3>
            <p>下一代前端构建工具</p>
          </div>
          <div class="tech-item">
            <h3>TypeScript</h3>
            <p>JavaScript 的超集，提供类型安全</p>
          </div>
          <div class="tech-item">
            <h3>Vue Router</h3>
            <p>Vue.js 官方路由管理器</p>
          </div>
          <div class="tech-item">
            <h3>Pinia</h3>
            <p>Vue 的状态管理库</p>
          </div>
          <div class="tech-item">
            <h3>ESLint</h3>
            <p>代码质量和风格检查工具</p>
          </div>
        </div>
      </div>
      
      <div class="store-demo">
        <h2>状态管理演示</h2>
        <p>全局计数器: {{ counterStore.count }}</p>
        <p>双倍计数: {{ counterStore.doubleCount }}</p>
        <button @click="counterStore.increment()" class="btn">
          增加计数
        </button>
        <button @click="counterStore.reset()" class="btn btn-secondary">
          重置计数
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCounterStore } from '../stores/counter';

const counterStore = useCounterStore();
</script>

<style scoped>
.about {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #213547;
  margin-bottom: 2rem;
  text-align: center;
}

.content {
  text-align: left;
}

.content p {
  font-size: 1.1em;
  line-height: 1.6;
  color: #555;
  margin-bottom: 1rem;
}

.tech-stack {
  margin: 3rem 0;
}

.tech-stack h2 {
  color: #213547;
  margin-bottom: 1.5rem;
  text-align: center;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.tech-item {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: transform 0.2s, box-shadow 0.2s;
}

.tech-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tech-item h3 {
  color: #646cff;
  margin-bottom: 0.5rem;
  font-size: 1.2em;
}

.tech-item p {
  color: #666;
  font-size: 0.9em;
  margin: 0;
}

.store-demo {
  margin: 3rem 0;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.store-demo h2 {
  color: #213547;
  margin-bottom: 1rem;
}

.store-demo p {
  font-size: 1.1em;
  margin: 0.5rem 0;
  color: #555;
}

.btn {
  background-color: #646cff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.25s;
  margin: 0.5rem;
}

.btn:hover {
  background-color: #535bf2;
}

.btn-secondary {
  background-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
}
</style>