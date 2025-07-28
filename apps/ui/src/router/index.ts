import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/create',
  },
  {
    path: '/create',
    name: 'create',
    component: () => import('../pages/CreateProject.vue'),
    meta: {
      title: '创建项目',
    },
  },
  {
    path: '/manage',
    name: 'manage',
    component: () => import('../pages/ProjectManage.vue'),
    meta: {
      title: '项目管理',
    },
  },
  {
    path: '/dev',
    name: 'dev',
    component: () => import('../pages/DevTools.vue'),
    meta: {
      title: '开发工具',
    },
  },
  {
    path: '/build',
    name: 'build',
    component: () => import('../pages/BuildTools.vue'),
    meta: {
      title: '构建打包',
    },
  },
  {
    path: '/git',
    name: 'git',
    component: () => import('../pages/GitWorkflow.vue'),
    meta: {
      title: 'Git 工作流',
    },
  },
  {
    path: '/deploy',
    name: 'deploy',
    component: () => import('../pages/DeployManage.vue'),
    meta: {
      title: '部署管理',
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../pages/Settings.vue'),
    meta: {
      title: '工具配置',
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - LDesign 脚手架工具`;
  }
  next();
});

export default router;