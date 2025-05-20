<template>
  <div class="common-layout">
    <el-header class="fixed-header">
      <Header />
    </el-header>

    <el-container class="body-container">
      <el-aside width="220px">
        <Sidebar :section="section" :subsection="subsection" />
      </el-aside>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'

defineProps({
  section: String,
  subsection: String
})

import '@/styles/index.css'
</script>

<style scoped>
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 95px; /* 和 Header 组件高度保持一致 */
  z-index: 1000;
}

.body-container {
  margin-top: 75px; /* 推开 header 高度，避免遮挡 */
  height: calc(100vh - 100px);
  overflow: auto;
}
</style>
