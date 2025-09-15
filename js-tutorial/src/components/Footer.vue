<template>
  <div class="footer">
    <div class="footer-content">
      <div class="center-content">
        <p>Copyright © {{ currentYear }} WanYuan. All rights reserved.</p>
        <div class="tech-stack">
          <span>Built with</span>
          <el-tag type="primary" size="small">Vue 3</el-tag>
          <el-tag type="warning" size="small">Vite</el-tag>
          <el-tag type="success" size="small">Element Plus</el-tag>
          <el-tag type="info" size="small">Express</el-tag>
          <el-tag type="danger" size="small">MySQL</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin-top: 40px;
  margin-left: 220px;
  height: 95px;
  display: flex;
  align-items: center;
}

.footer-content {
  width: 100%;
  padding: 0 40px;
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
}

/* 移动端适配 / Mobile responsive */
@media (max-width: 768px) {
  .footer {
    margin: 20px 0 0 0;
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