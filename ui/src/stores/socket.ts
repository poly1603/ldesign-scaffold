import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import { ElMessage } from 'element-plus'

export const useSocketStore = defineStore('socket', () => {
  // State
  const socket = ref<Socket | null>(null)
  const connected = ref(false)
  const connecting = ref(false)
  const error = ref<string | null>(null)
  const lastConnectedAt = ref<Date | null>(null)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  
  // Getters
  const isConnected = computed(() => connected.value)
  const isConnecting = computed(() => connecting.value)
  const hasError = computed(() => error.value !== null)
  const connectionStatus = computed(() => {
    if (connecting.value) return 'connecting'
    if (connected.value) return 'connected'
    if (error.value) return 'error'
    return 'disconnected'
  })
  
  // Actions
  const connect = () => {
    if (socket.value?.connected) {
      return
    }
    
    connecting.value = true
    error.value = null
    
    try {
      socket.value = io('http://localhost:3000', {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000
      })
      
      setupEventListeners()
    } catch (err) {
      console.error('Socket connection error:', err)
      error.value = 'Failed to create socket connection'
      connecting.value = false
    }
  }
  
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
    connected.value = false
    connecting.value = false
    error.value = null
    lastConnectedAt.value = null
    reconnectAttempts.value = 0
  }
  
  const emit = (event: string, data?: any) => {
    if (socket.value?.connected) {
      socket.value.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot emit event:', event)
    }
  }
  
  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socket.value) {
      socket.value.on(event, callback)
    }
  }
  
  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socket.value) {
      socket.value.off(event, callback)
    }
  }
  
  const setupEventListeners = () => {
    if (!socket.value) return
    
    socket.value.on('connect', () => {
      console.log('Socket connected')
      connected.value = true
      connecting.value = false
      error.value = null
      lastConnectedAt.value = new Date()
      reconnectAttempts.value = 0
      
      ElMessage.success('已连接到服务器')
    })
    
    socket.value.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      connected.value = false
      connecting.value = false
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect
        ElMessage.warning('服务器主动断开连接')
      } else {
        // Client or network issue, will auto-reconnect
        ElMessage.warning('与服务器断开连接')
      }
    })
    
    socket.value.on('connect_error', (err) => {
      console.error('Socket connection error:', err)
      connected.value = false
      connecting.value = false
      error.value = err.message || 'Connection failed'
      reconnectAttempts.value++
      
      if (reconnectAttempts.value >= maxReconnectAttempts) {
        ElMessage.error('无法连接到服务器，请检查网络连接')
      }
    })
    
    socket.value.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
      ElMessage.success('重新连接成功')
    })
    
    socket.value.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnect attempt:', attemptNumber)
      connecting.value = true
    })
    
    socket.value.on('reconnect_error', (err) => {
      console.error('Socket reconnect error:', err)
      connecting.value = false
    })
    
    socket.value.on('reconnect_failed', () => {
      console.error('Socket reconnect failed')
      connecting.value = false
      error.value = 'Reconnection failed'
      ElMessage.error('重连失败，请刷新页面重试')
    })
    
    // Application-specific events
    socket.value.on('project:created', (data) => {
      ElMessage.success(`项目 "${data.name}" 创建成功！`)
    })
    
    socket.value.on('project:progress', (data) => {
      // Handle project creation progress
      console.log('Project progress:', data)
    })
    
    socket.value.on('project:error', (data) => {
      ElMessage.error(`项目创建失败: ${data.message}`)
    })
    
    socket.value.on('environment:checked', (data) => {
      console.log('Environment check result:', data)
    })
    
    socket.value.on('notification', (data) => {
      const { type, title, message } = data
      switch (type) {
        case 'success':
          ElMessage.success(message)
          break
        case 'warning':
          ElMessage.warning(message)
          break
        case 'error':
          ElMessage.error(message)
          break
        default:
          ElMessage.info(message)
      }
    })
  }
  
  // Auto-connect on store creation
  const initialize = () => {
    connect()
  }
  
  return {
    // State
    socket,
    connected,
    connecting,
    error,
    lastConnectedAt,
    reconnectAttempts,
    
    // Getters
    isConnected,
    isConnecting,
    hasError,
    connectionStatus,
    
    // Actions
    connect,
    disconnect,
    emit,
    on,
    off,
    initialize
  }
})
