import { createApp } from 'vue';
import { createPinia } from 'pinia';
import TDesign from 'tdesign-vue-next';
import 'tdesign-vue-next/es/style/index.css';

import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(TDesign);

app.mount('#app');

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err, info);
};

// 全局警告处理
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('全局警告:', msg, trace);
};