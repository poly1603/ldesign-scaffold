import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUIStore = defineStore('ui', () => {
  // 状态
  const sidebarCollapsed = ref(false);
  const activeMenu = ref('');
  const pageTitle = ref('LDesign Scaffold');
  const breadcrumbs = ref<{ title: string; path?: string }[]>([]);
  const darkMode = ref(false);
  const mobileView = ref(false);
  const previewMode = ref<'desktop' | 'tablet' | 'mobile'>('desktop');
  const previewUrl = ref('');
  const previewVisible = ref(false);
  const logAutoScroll = ref(true);
  const notifications = ref<Array<{
    id: string;
    title: string;
    content: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
  }>>([]);

  // 计算属性
  const unreadNotificationsCount = computed(() => {
    return notifications.value.filter(n => !n.read).length;
  });

  const previewDimensions = computed(() => {
    switch (previewMode.value) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      case 'desktop':
      default:
        return { width: '100%', height: '100%' };
    }
  });

  // 操作
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  const setActiveMenu = (menu: string) => {
    activeMenu.value = menu;
  };

  const setPageTitle = (title: string) => {
    pageTitle.value = title;
    // 更新浏览器标题
    document.title = `${title} - LDesign Scaffold`;
  };

  const setBreadcrumbs = (items: { title: string; path?: string }[]) => {
    breadcrumbs.value = items;
  };

  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value;
    applyDarkMode();
  };

  const setDarkMode = (isDark: boolean) => {
    darkMode.value = isDark;
    applyDarkMode();
  };

  const applyDarkMode = () => {
    if (darkMode.value) {
      document.documentElement.setAttribute('theme-mode', 'dark');
    } else {
      document.documentElement.setAttribute('theme-mode', 'light');
    }
  };

  const setMobileView = (isMobile: boolean) => {
    mobileView.value = isMobile;
    if (isMobile) {
      sidebarCollapsed.value = true;
    }
  };

  const setPreviewMode = (mode: 'desktop' | 'tablet' | 'mobile') => {
    previewMode.value = mode;
  };

  const openPreview = (url: string) => {
    previewUrl.value = url;
    previewVisible.value = true;
  };

  const closePreview = () => {
    previewVisible.value = false;
  };

  const refreshPreview = () => {
    // 通过修改URL参数来刷新iframe
    const separator = previewUrl.value.includes('?') ? '&' : '?';
    previewUrl.value = `${previewUrl.value.split(separator)[0]}${separator}refresh=${Date.now()}`;
  };

  const setLogAutoScroll = (autoScroll: boolean) => {
    logAutoScroll.value = autoScroll;
  };

  const addNotification = (notification: {
    title: string;
    content: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    notifications.value.unshift({
      id,
      ...notification,
      timestamp: new Date(),
      read: false,
    });
    
    // 限制通知数量
    if (notifications.value.length > 100) {
      notifications.value = notifications.value.slice(0, 100);
    }
    
    return id;
  };

  const markNotificationAsRead = (id: string) => {
    const notification = notifications.value.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  };

  const markAllNotificationsAsRead = () => {
    notifications.value.forEach(n => {
      n.read = true;
    });
  };

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  };

  const clearNotifications = () => {
    notifications.value = [];
  };

  // 响应式布局
  const setupResponsiveListeners = () => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // 初始化
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  // 初始化
  const init = () => {
    // 检测系统暗色模式
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    
    // 设置响应式监听
    setupResponsiveListeners();
  };

  return {
    // 状态
    sidebarCollapsed,
    activeMenu,
    pageTitle,
    breadcrumbs,
    darkMode,
    mobileView,
    previewMode,
    previewUrl,
    previewVisible,
    logAutoScroll,
    notifications,
    
    // 计算属性
    unreadNotificationsCount,
    previewDimensions,
    
    // 操作
    toggleSidebar,
    setActiveMenu,
    setPageTitle,
    setBreadcrumbs,
    toggleDarkMode,
    setDarkMode,
    applyDarkMode,
    setMobileView,
    setPreviewMode,
    openPreview,
    closePreview,
    refreshPreview,
    setLogAutoScroll,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearNotifications,
    
    // 初始化
    init,
  };
});