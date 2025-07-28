import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const sidebarCollapsed = ref(false)
  const loading = ref(false)
  const theme = ref<'light' | 'dark'>('light')
  const language = ref('zh-CN')
  
  // Getters
  const isDark = computed(() => theme.value === 'dark')
  const isLoading = computed(() => loading.value)
  
  // Actions
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed.value))
  }
  
  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
    localStorage.setItem('sidebarCollapsed', String(collapsed))
  }
  
  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }
  
  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }
  
  const setLanguage = (lang: string) => {
    language.value = lang
    localStorage.setItem('language', lang)
  }
  
  // Initialize from localStorage
  const initializeFromStorage = () => {
    // Sidebar state
    const storedSidebarState = localStorage.getItem('sidebarCollapsed')
    if (storedSidebarState !== null) {
      sidebarCollapsed.value = storedSidebarState === 'true'
    }
    
    // Theme
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (storedTheme) {
      setTheme(storedTheme)
    } else {
      // Detect system theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
    
    // Language
    const storedLanguage = localStorage.getItem('language')
    if (storedLanguage) {
      language.value = storedLanguage
    }
  }
  
  // Listen to system theme changes
  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }
  
  return {
    // State
    sidebarCollapsed,
    loading,
    theme,
    language,
    
    // Getters
    isDark,
    isLoading,
    
    // Actions
    toggleSidebar,
    setSidebarCollapsed,
    setLoading,
    setTheme,
    toggleTheme,
    setLanguage,
    initializeFromStorage,
    watchSystemTheme
  }
})
