<template>
  <div id="app">
    <t-layout>
      <!-- 侧边导航 -->
      <t-aside width="240px">
        <div class="logo">
          <h2>LDesign</h2>
        </div>
        <t-menu
          v-model:value="activeMenu"
          :default-expanded="['project', 'tools']"
          @change="handleMenuChange"
        >
          <t-submenu value="project" title="项目管理">
            <template #icon>
              <folder-icon />
            </template>
            <t-menu-item value="create" to="/create">
              <template #icon>
                <add-icon />
              </template>
              创建项目
            </t-menu-item>
            <t-menu-item value="manage" to="/manage">
              <template #icon>
                <view-list-icon />
              </template>
              项目列表
            </t-menu-item>
          </t-submenu>
          
          <t-submenu value="tools" title="开发工具">
            <template #icon>
              <tools-icon />
            </template>
            <t-menu-item value="dev" to="/dev">
              <template #icon>
                <play-circle-icon />
              </template>
              开发服务
            </t-menu-item>
            <t-menu-item value="build" to="/build">
              <template #icon>
                <setting-icon />
              </template>
              构建打包
            </t-menu-item>
            <t-menu-item value="git" to="/git">
              <template #icon>
                <logo-github-icon />
              </template>
              Git 工作流
            </t-menu-item>
            <t-menu-item value="deploy" to="/deploy">
              <template #icon>
                <cloud-upload-icon />
              </template>
              部署管理
            </t-menu-item>
          </t-submenu>
          
          <t-menu-item value="settings" to="/settings">
            <template #icon>
              <setting-icon />
            </template>
            工具配置
          </t-menu-item>
        </t-menu>
      </t-aside>
      
      <!-- 主内容区域 -->
      <t-layout>
        <t-header class="header">
          <div class="header-content">
            <h3>{{ pageTitle }}</h3>
            <div class="header-actions">
              <t-button theme="default" variant="text">
                <template #icon>
                  <help-circle-icon />
                </template>
                帮助
              </t-button>
            </div>
          </div>
        </t-header>
        
        <t-content class="content">
          <router-view />
        </t-content>
      </t-layout>
    </t-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  FolderIcon,
  AddIcon,
  ViewListIcon,
  ToolsIcon,
  PlayCircleIcon,
  SettingIcon,
  LogoGithubIcon,
  CloudUploadIcon,
  HelpCircleIcon,
} from 'tdesign-icons-vue-next';

const route = useRoute();
const activeMenu = ref('create');

const pageTitle = computed(() => {
  const titleMap: Record<string, string> = {
    create: '创建项目',
    manage: '项目管理',
    dev: '开发工具',
    build: '构建打包',
    git: 'Git 工作流',
    deploy: '部署管理',
    settings: '工具配置',
  };
  return titleMap[route.name as string] || 'LDesign 脚手架工具';
});

const handleMenuChange = (value: string) => {
  activeMenu.value = value;
};
</script>

<style scoped>
#app {
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.logo {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid var(--td-border-level-1-color);
}

.logo h2 {
  margin: 0;
  color: var(--td-brand-color);
  font-weight: 600;
}

.header {
  background: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-border-level-1-color);
  padding: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 100%;
}

.header-content h3 {
  margin: 0;
  color: var(--td-text-color-primary);
}

.content {
  padding: 24px;
  background: var(--td-bg-color-page);
  overflow-y: auto;
}
</style>