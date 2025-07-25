<template>
  <div class="common-layout">
    <el-header class="fixed-header">
      <Header @toggle-sidebar="toggleSidebar" />
    </el-header>

    <!-- 🔧 侧边栏浮层模式：仅手机端显示 -->
    <transition name="fade">
      <div
        class="sidebar-mask"
        v-if="isMobile && sidebarVisible"
        @click.self="closeSidebar"
      >
        <Sidebar :section="section" :subsection="subsection" @close-sidebar="closeSidebar" />
      </div>
    </transition>

    <!-- 🔧 桌面端结构 -->
    <el-container class="body-container">
      <el-aside width="220px" v-show="!isMobile">
        <Sidebar :section="section" :subsection="subsection" />
      </el-aside>

      <el-main class="main-content">
        <TutorialContent :path="subsection || 'what-is-js'" />
      </el-main>
    </el-container>

    <div class="footer-wrapper">
      <Footer />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import TutorialContent from '@/components/TutorialContent.vue'
import Footer from '@/components/Footer.vue'

defineProps({
  section: String,
  subsection: String
})

// 🔧 控制侧边栏显示
const sidebarVisible = ref(false)
const isMobile = ref(window.innerWidth <= 768)

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}
const closeSidebar = () => {
  sidebarVisible.value = false
}

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    sidebarVisible.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
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

.footer-wrapper {
  width: 100%;
  margin-top: auto;
}

/* 🔧 手机端浮层侧边栏遮罩 */
.sidebar-mask {
  position: fixed;
  top: 95px;
  left: 0;
  width: 80%;
  max-width: 260px;
  height: calc(100vh - 95px);
  background: var(--bg-color);
  z-index: 2000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  transition: transform 0.3s ease;
}

/* 遮罩层外部灰色背景 */
.sidebar-mask::after {
  content: '';
  position: fixed;
  top: 95px;
  left: 80%;
  width: 20%;
  height: calc(100vh - 95px);
  background-color: rgba(0, 0, 0, 0.3);
  z-index: -1;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端样式 - 去除外部边框和边距 */
@media (max-width: 768px) {
  .common-layout {
    margin: 0;
    padding: 0;
  }

  .fixed-header {
    position: relative;
    top: 0;
  }
  
  .body-container {
    margin-top: 0px; 
    margin-left: 0;
    margin-right: 0;
    padding: 0;
  }
  
  .main-content {
    margin-top: 0px; 
    margin-left: 0;
    margin-right: 0;
    padding: 15px; 
  }
  
  .footer-wrapper {
    margin: 0;
    padding: 0;
  }
}
</style>
