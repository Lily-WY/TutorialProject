<template>
  <div class="common-layout">
    <el-header class="fixed-header">
      <Header />
    </el-header>

    <el-container class="body-container">
      <el-aside width="220px">
        <Sidebar :section="section" :subsection="subsection" />
      </el-aside>

      <el-main class="main-content">
        <TutorialContent :path="subsection || 'what-is-js'" />
      </el-main>
    </el-container>

    <!-- 将 Footer 放在和 Header 相同的层级 -->
    <div class="footer-wrapper">
      <Footer />
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import TutorialContent from '@/components/TutorialContent.vue'
import Footer from '@/components/Footer.vue'

defineProps({
  section: String,
  subsection: String
})

import '@/styles/index.css'
</script>

<style scoped>
.common-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 95px;
  z-index: 1000;
}

.body-container {
  margin-top: 55px;
  flex: 1;
  min-height: calc(100vh - 95px);
}

.main-content {
  margin-top: 45px;
}

/* 确保 Footer 包装器占满宽度 */
.footer-wrapper {
  width: 100%;
  margin-top: auto; /* 自动推到底部 */
}
</style>
