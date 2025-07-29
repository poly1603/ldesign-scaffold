# {{projectName}}

{{description}}

## 🚀 快速开始

### 安装

```bash
npm install {{projectName}}
# 或
yarn add {{projectName}}
# 或
pnpm add {{projectName}}
```

### 使用

#### 完整引入

```javascript
import Vue from 'vue';
import {{pascalCaseName}} from '{{projectName}}';
import '{{projectName}}/dist/style.css';

Vue.use({{pascalCaseName}});
```

#### 按需引入

```javascript
import { Button, Input } from '{{projectName}}';
import '{{projectName}}/dist/style.css';

export default {
  components: {
    Button,
    Input
  }
};
```

## 📖 组件文档

### Button 按钮

基础的按钮组件。

#### 基础用法

```vue
<template>
  <div>
    <Button type="primary">主要按钮</Button>
    <Button type="secondary">次要按钮</Button>
  </div>
</template>
```

#### API

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| type | 按钮类型 | string | primary / secondary / success / warning / danger | primary |
| size | 按钮尺寸 | string | small / medium / large | medium |
| disabled | 是否禁用 | boolean | — | false |
| loading | 是否加载中 | boolean | — | false |

#### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击事件 | (event: MouseEvent) |

### Input 输入框

基础的输入框组件。

#### 基础用法

```vue
<template>
  <div>
    <Input v-model="value" placeholder="请输入内容" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      value: ''
    };
  }
};
</script>
```

#### API

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| type | 输入框类型 | string | text / password / email / number / tel / url | text |
| size | 输入框尺寸 | string | small / medium / large | medium |
| value | 绑定值 | string | — | — |
| placeholder | 占位文本 | string | — | — |
| disabled | 是否禁用 | boolean | — | false |
| readonly | 是否只读 | boolean | — | false |
| error | 是否显示错误状态 | boolean | — | false |

#### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| input | 输入事件 | (value: string) |
| focus | 获得焦点事件 | (event: FocusEvent) |
| blur | 失去焦点事件 | (event: FocusEvent) |
| change | 值改变事件 | (event: Event) |

## 🛠️ 开发

### 环境要求

- Node.js >= 16
- pnpm >= 7

### 开发命令

```bash
# 安装依赖
pnpm install

# 启动 Storybook 开发服务器
pnpm dev

# 运行测试
pnpm test

# 构建组件库
pnpm build

# 构建文档
pnpm build:docs

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

## 📄 许可证

MIT License
