import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  minimum: 0.2,
  speed: 500
})

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: 'dashboard.title',
          icon: 'House'
        }
      },
      {
        path: '/projects',
        name: 'Projects',
        component: () => import('@/views/Projects.vue'),
        meta: {
          title: 'projects.title',
          icon: 'Folder'
        }
      },
      {
        path: '/create',
        name: 'CreateProject',
        component: () => import('@/views/CreateProject.vue'),
        meta: {
          title: 'create.title',
          icon: 'Plus'
        }
      },
      {
        path: '/project/:id',
        name: 'ProjectDetail',
        component: () => import('@/views/ProjectDetail.vue'),
        meta: {
          title: 'project.detail',
          hideInMenu: true
        }
      },
      {
        path: '/tools',
        name: 'Tools',
        component: () => import('@/views/Tools.vue'),
        meta: {
          title: 'tools.title',
          icon: 'Tools'
        }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: {
          title: 'settings.title',
          icon: 'Setting'
        }
      }
    ]
  },
  {
    path: '/wizard',
    name: 'ProjectWizard',
    component: () => import('@/views/ProjectWizard.vue'),
    meta: {
      title: 'wizard.title',
      fullscreen: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '404',
      hideInMenu: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Global navigation guards
router.beforeEach((to, from, next) => {
  NProgress.start()
  
  // Set page title
  const title = to.meta?.title as string
  if (title) {
    document.title = `${title} - LDesign Scaffold`
  }
  
  next()
})

router.afterEach(() => {
  NProgress.done()
})

router.onError((error) => {
  console.error('Router error:', error)
  NProgress.done()
})

export default router
