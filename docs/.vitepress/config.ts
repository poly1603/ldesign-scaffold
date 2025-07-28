import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign Scaffold',
  description: '企业级 Node.js 脚手架生成器',
  lang: 'zh-CN',

  // 忽略死链接检查
  ignoreDeadLinks: [
    // 忽略本地开发服务器链接
    /^http:\/\/localhost/,
    // 忽略不存在的内部链接
    '/guide/performance',
    '/guide/deployment',
    '/guide/tools'
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: 'GitHub', link: 'https://github.com/ldesign/ldesign-scaffold' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' }
          ]
        },
        {
          text: '基础',
          items: [
            { text: '创建项目', link: '/guide/creating-projects' },
            { text: '项目类型', link: '/guide/project-types' },
            { text: '特性配置', link: '/guide/features' },
            { text: '模板系统', link: '/guide/templates' }
          ]
        },
        {
          text: '高级',
          items: [
            { text: '可视化界面', link: '/guide/ui-interface' },
            { text: 'Git 管理', link: '/guide/git-management' },
            { text: 'Docker 支持', link: '/guide/docker-support' },
            { text: '自定义模板', link: '/guide/custom-templates' }
          ]
        },
        {
          text: '工具',
          items: [
            { text: '环境检测', link: '/guide/environment-check' },
            { text: 'Nginx 配置', link: '/guide/nginx-config' },
            { text: '字体管理', link: '/guide/font-management' },
            { text: '图标管理', link: '/guide/icon-management' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '命令行接口', link: '/api/cli' },
            { text: '配置选项', link: '/api/config' },
            { text: '核心 API', link: '/api/core' },
            { text: '插件系统', link: '/api/plugins' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例项目',
          items: [
            { text: '概览', link: '/examples/' },
            { text: 'Vue 3 项目', link: '/examples/vue3' },
            { text: 'Vue 2 项目', link: '/examples/vue2' },
            { text: 'React 项目', link: '/examples/react' },
            { text: 'Node.js API', link: '/examples/nodejs' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/ldesign-scaffold' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign Team'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/ldesign/ldesign-scaffold/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  markdown: {
    lineNumbers: true
  }
})
