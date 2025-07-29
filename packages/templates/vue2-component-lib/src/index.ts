import Vue from 'vue';
import Button from './components/Button/Button.vue';
import Input from './components/Input/Input.vue';

// 导入样式
import './styles/index.less';

const components = {
  Button,
  Input
};

// 定义 install 方法，接收 Vue 作为参数
const install = (vue: typeof Vue) => {
  // 遍历注册全局组件
  Object.keys(components).forEach(key => {
    vue.component(key, components[key as keyof typeof components]);
  });
};

// 判断是否是直接引入文件，如果是，就不用调用 Vue.use()
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

// 导出的对象必须具有 install，才能被 Vue.use() 方法安装
export default {
  install,
  ...components
};

// 按需引入
export {
  Button,
  Input
};
