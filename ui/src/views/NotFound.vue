<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <div class="error-title">页面未找到</div>
      <div class="error-description">
        抱歉，您访问的页面不存在或已被移除。
      </div>
      <div class="error-actions">
        <el-button type="primary" @click="$router.push('/')">
          <el-icon><House /></el-icon>
          返回首页
        </el-button>
        <el-button @click="$router.back()">
          <el-icon><Back /></el-icon>
          返回上页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No script needed for this simple component
</script>

<style lang="scss" scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  
  .not-found-content {
    text-align: center;
    
    .error-code {
      font-size: 120px;
      font-weight: bold;
      color: var(--el-color-primary);
      margin-bottom: 20px;
      line-height: 1;
    }
    
    .error-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 12px;
    }
    
    .error-description {
      font-size: 16px;
      color: var(--el-text-color-secondary);
      margin-bottom: 32px;
    }
    
    .error-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
  }
}
</style>
