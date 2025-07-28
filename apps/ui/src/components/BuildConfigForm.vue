<template>
  <div class="build-config-form">
    <t-form :data="formData" :rules="rules" layout="vertical">
      <t-row :gutter="16">
        <t-col :span="6">
          <t-form-item label="输出目录" name="outDir">
            <t-input v-model="formData.outDir" placeholder="构建输出目录" />
          </t-form-item>
        </t-col>
        
        <t-col :span="6">
          <t-form-item label="构建目标" name="target">
            <t-select v-model="formData.target" placeholder="选择构建目标">
              <t-option value="es2015" label="ES2015" />
              <t-option value="es2018" label="ES2018" />
              <t-option value="es2020" label="ES2020" />
              <t-option value="esnext" label="ESNext" />
            </t-select>
          </t-form-item>
        </t-col>
        
        <t-col :span="6">
          <t-form-item label="代码分割" name="codeSplitting">
            <t-switch v-model="formData.codeSplitting" />
          </t-form-item>
        </t-col>
        
        <t-col :span="6">
          <t-form-item label="Tree Shaking" name="treeShaking">
            <t-switch v-model="formData.treeShaking" />
          </t-form-item>
        </t-col>
      </t-row>
      
      <t-row :gutter="16">
        <t-col :span="6">
          <t-form-item label="生成 Sourcemap" name="sourcemap">
            <t-switch v-model="formData.sourcemap" />
          </t-form-item>
        </t-col>
        
        <t-col :span="6">
          <t-form-item label="代码压缩" name="minify">
            <t-switch v-model="formData.minify" />
          </t-form-item>
        </t-col>
        
        <t-col :span="6">
          <t-form-item label="CSS 提取" name="extractCSS">
            <t-switch v-model="formData.extractCSS" />
          </t-form-item>
        </t-col>
        
        <t-col :span="6">
          <t-form-item label="资源内联" name="inlineAssets">
            <t-switch v-model="formData.inlineAssets" />
          </t-form-item>
        </t-col>
      </t-row>
      
      <t-form-item label="环境变量" name="envVars">
        <div class="env-vars">
          <div
            v-for="(envVar, index) in formData.envVars"
            :key="index"
            class="env-var-item"
          >
            <t-input
              v-model="envVar.key"
              placeholder="变量名"
              class="env-key"
            />
            <t-input
              v-model="envVar.value"
              placeholder="变量值"
              class="env-value"
            />
            <t-button
              theme="default"
              variant="text"
              @click="removeEnvVar(index)"
            >
              <delete-icon />
            </t-button>
          </div>
          
          <t-button theme="default" variant="dashed" @click="addEnvVar">
            <template #icon>
              <add-icon />
            </template>
            添加环境变量
          </t-button>
        </div>
      </t-form-item>
      
      <t-form-item label="别名配置" name="alias">
        <div class="alias-config">
          <div
            v-for="(aliasItem, index) in formData.alias"
            :key="index"
            class="alias-item"
          >
            <t-input
              v-model="aliasItem.from"
              placeholder="别名"
              class="alias-from"
            />
            <t-input
              v-model="aliasItem.to"
              placeholder="路径"
              class="alias-to"
            />
            <t-button
              theme="default"
              variant="text"
              @click="removeAlias(index)"
            >
              <delete-icon />
            </t-button>
          </div>
          
          <t-button theme="default" variant="dashed" @click="addAlias">
            <template #icon>
              <add-icon />
            </template>
            添加别名
          </t-button>
        </div>
      </t-form-item>
      
      <t-form-item label="外部依赖" name="externals">
        <t-select
          v-model="formData.externals"
          multiple
          filterable
          allow-input
          placeholder="输入或选择外部依赖"
        >
          <t-option value="vue" label="vue" />
          <t-option value="react" label="react" />
          <t-option value="react-dom" label="react-dom" />
          <t-option value="lodash" label="lodash" />
          <t-option value="axios" label="axios" />
        </t-select>
      </t-form-item>
      
      <t-form-item label="自定义配置" name="customConfig">
        <t-textarea
          v-model="formData.customConfig"
          placeholder="输入自定义构建配置 (JSON 格式)"
          :rows="6"
        />
      </t-form-item>
    </t-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { AddIcon, DeleteIcon } from 'tdesign-icons-vue-next';
import type { BuildConfig } from '../types/project';

interface Props {
  modelValue: BuildConfig;
  mode: 'development' | 'production' | 'test';
}

interface Emits {
  (e: 'update:modelValue', value: BuildConfig): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表单数据
const formData = reactive({
  outDir: props.modelValue.outDir || 'dist',
  target: props.modelValue.target || 'es2018',
  sourcemap: props.modelValue.sourcemap ?? true,
  minify: props.modelValue.minify ?? false,
  codeSplitting: true,
  treeShaking: true,
  extractCSS: true,
  inlineAssets: false,
  envVars: [
    { key: 'NODE_ENV', value: props.mode },
  ],
  alias: [
    { from: '@', to: './src' },
  ],
  externals: [] as string[],
  customConfig: '',
});

// 表单验证规则
const rules = {
  outDir: [
    { required: true, message: '请输入输出目录' },
  ],
  target: [
    { required: true, message: '请选择构建目标' },
  ],
};

// 方法
const addEnvVar = () => {
  formData.envVars.push({ key: '', value: '' });
};

const removeEnvVar = (index: number) => {
  formData.envVars.splice(index, 1);
};

const addAlias = () => {
  formData.alias.push({ from: '', to: '' });
};

const removeAlias = (index: number) => {
  formData.alias.splice(index, 1);
};

// 监听表单数据变化
watch(
  formData,
  (newValue) => {
    emit('update:modelValue', {
      mode: props.mode,
      outDir: newValue.outDir,
      target: newValue.target,
      sourcemap: newValue.sourcemap,
      minify: newValue.minify,
    });
  },
  { deep: true }
);
</script>

<style scoped>
.build-config-form {
  padding: 16px 0;
}

.env-vars,
.alias-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.env-var-item,
.alias-item {
  display: flex;
  gap: 12px;
  align-items: center;
}

.env-key,
.alias-from {
  flex: 1;
}

.env-value,
.alias-to {
  flex: 2;
}
</style>