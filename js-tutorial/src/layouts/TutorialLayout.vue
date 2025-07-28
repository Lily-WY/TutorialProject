<template>
  <div class="common-layout">
    <el-header class="fixed-header">
      <Header @toggle-sidebar="toggleSidebar" />
    </el-header>

    <el-container class="body-container">
      <!-- 侧边栏：桌面端固定显示，移动端可切换 -->
      <el-aside 
        :width="isMobile ? '100%' : '220px'" 
        v-show="!isMobile || sidebarVisible"
        class="sidebar-container"
        :class="{ 'mobile-sidebar': isMobile }"
      >
        <Sidebar :section="section" :subsection="subsection" @close-sidebar="closeSidebar" />
      </el-aside>

      <!-- 主内容区：移动端隐藏侧边栏时显示，桌面端始终显示 -->
      <el-main 
        class="main-content"
        v-show="!isMobile || !sidebarVisible"
        :class="{ 'mobile-main': isMobile }"
      >
        <TutorialContent :path="subsection || 'what-is-js'" />
      </el-main>
    </el-container>

    <div class="footer-wrapper" v-show="!isMobile || !sidebarVisible">
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

// 切换侧边栏显示状态
const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
  console.log('TutorialLayout - 侧边栏状态:', sidebarVisible.value)
}

// 关闭侧边栏
const closeSidebar = () => {
  sidebarVisible.value = false
}

const handleResize = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth <= 768
  
  // 如果从移动端切换到桌面端，重置侧边栏状态
  if (wasMobile && !isMobile.value) {
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

.sidebar-container {
  transition: all 0.3s ease;
}

.main-content {
  margin-top: 45px;
  transition: all 0.3s ease;
}

.footer-wrapper {
  width: 100%;
  margin-top: auto;
}

/* 移动端样式 */
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
    margin-top: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    flex-direction: column; /* 移动端垂直布局 */
  }
  
  .sidebar-container.mobile-sidebar {
    width: 100% !important;
    height: auto;
    order: 1; /* 侧边栏在上方 */
  }
  
  .main-content.mobile-main {
    margin-top: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 15px;
    width: 100%;
    order: 2; /* 主内容在下方 */
  }
  
  .footer-wrapper {
    margin: 0;
    padding: 0;
    order: 3; /* Footer 在最下方 */
  }
}
</style>
