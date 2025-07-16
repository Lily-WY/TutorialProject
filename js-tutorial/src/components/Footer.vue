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
  margin-top: 40px;
  transition: background-color 0.3s ease, color 0.3s ease;
  height: 95px;
  display: flex;
  align-items: center; /* 垂直居中 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.footer-content {
  max-width: 1200px; /* 与 Header 保持一致的最大宽度 */
  margin: 0 auto;
  padding: 0 40px; /* 与 Header 保持一致的左右内边距 */
  width: 100%; /* 这里保持 100% 是为了在容器内占满宽度 */
  display: flex;
  justify-content: center; /* 水平居中 */
}

.center-content {
  display: flex;
  flex-direction: column;
  align-items: center; /* 内容居中 */
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
  .footer-content {
    padding: 0 20px;
  }
  
  .tech-stack {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>