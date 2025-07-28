<template>
  <div class="home">
    <div class="logo">
      <img alt="Vue logo" src="../assets/vue.svg" />
    </div>
    <h1>欢迎使用 {{name}}</h1>
    <p class="description">
      这是一个基于 Vue 3 + Vite + TypeScript 的现代化前端项目模板
    </p>
    
    <div class="features">
      <h2>特性</h2>
      <ul>
        <li>⚡️ Vue 3 + Vite - 快速的开发体验</li>
        <li>🔥 TypeScript - 类型安全</li>
        <li>📦 Vue Router - 路由管理</li>
        <li>🍍 Pinia - 状态管理</li>
        <li>🎨 ESLint + Prettier - 代码规范</li>
      </ul>
    </div>
    
    <div class="actions">
      <button @click="increment" class="btn">
        计数: {{ count }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCounterStore } from '../stores/counter';

const count = ref(0);
const counterStore = useCounterStore();

const increment = () => {
  count.value++;
  counterStore.increment();
};
</script>

<style scoped>
.home {
  padding: 2rem;
}

.logo {
  margin-bottom: 2rem;
}

.logo img {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo img:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
  margin-bottom: 1rem;
  color: #213547;
}

.description {
  font-size: 1.2em;
  color: #666;
  margin-bottom: 2rem;
}

.features {
  margin: 2rem 0;
  text-align: left;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.features h2 {
  text-align: center;
  margin-bottom: 1rem;
  color: #213547;
}

.features ul {
  list-style: none;
  padding: 0;
}

.features li {
  padding: 0.5rem 0;
  font-size: 1.1em;
  color: #555;
}

.actions {
  margin-top: 2rem;
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
}

.btn:hover {
  background-color: #535bf2;
}

.btn:focus {
  outline: 4px auto -webkit-focus-ring-color;
}