/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'nprogress' {
  interface NProgress {
    start(): NProgress
    done(): NProgress
    set(n: number): NProgress
    inc(n?: number): NProgress
    configure(options: Partial<{
      minimum: number
      template: string
      easing: string
      speed: number
      trickle: boolean
      trickleSpeed: number
      showSpinner: boolean
      barSelector: string
      spinnerSelector: string
      parent: string
    }>): NProgress
  }
  
  const nprogress: NProgress
  export default nprogress
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
