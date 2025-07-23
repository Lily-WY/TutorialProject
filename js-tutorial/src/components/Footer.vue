<template>
  <div class="footer">
    <div class="footer-content">
      <div class="center-content">
        <p>Copyright © {{ currentYear }} wanyuan. All rights reserved.</p>
        <div class="tech-stack">
          <span>Built with</span>
          <el-tag type="info" size="small">Vue.js</el-tag>
          <el-tag type="info" size="small">Element Plus</el-tag>
          <el-tag type="info" size="small">Express</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// 获取当前年份
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin-top: 40px;
  margin-left: 220px; /* 与主内容区保持一致的左边距 */
  transition: background-color 0.3s ease, color 0.3s ease;
  height: 95px;
  display: flex;
  align-items: center;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px; /* 与主内容区保持一致的左右内边距 */
  width: 100%;
  display: flex;
  justify-content: center;
}

.center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.center-content p {
  margin: 0;
  font-size: 16px;
  color: var(--text-color);
  opacity: 0.8;
  font-weight: 500;
  text-align: center;
}

.tech-stack {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tech-stack span {
  font-size: 16px;
  color: var(--text-color);
  opacity: 0.8;
  margin-right: 4px;
}

.tech-stack .el-tag {
  margin: 0 2px;
  font-size: 13px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer {
    margin-left: 0; /* 小屏幕下移除左边距 */
  }
  
  .footer-content {
    padding: 0 20px;
  }
  
  .tech-stack {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>