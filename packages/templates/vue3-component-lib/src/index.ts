import type { App } from 'vue';
import Button from './components/Button/Button.vue';
import Input from './components/Input/Input.vue';

// 导入样式
import './styles/index.less';

const components = {
  Button,
  Input
};

// 定义 install 方法，接收 App 作为参数
const install = (app: App) => {
  // 遍历注册全局组件
  Object.keys(components).forEach(key => {
    app.component(key, components[key as keyof typeof components]);
  });
};

// 导出的对象必须具有 install，才能被 app.use() 方法安装
export default {
  install,
  ...components
};

// 按需引入
export {
  Button,
  Input
};
