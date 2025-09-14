<template>
  <el-header class="header">
    <div class="left">
      <!-- 移动端菜单开关按钮 -->
      <el-icon class="menu-toggle" @click="toggleSidebar" v-show="isMobile">
        <component :is="sidebarVisible ? Fold : Expand" />
      </el-icon>
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
    </div>

    <div class="right">
      <!-- 移动端图标组 -->
      <div class="icon-group" v-if="isMobile">
        <el-icon @click="toggleMobileSearch"><Search /></el-icon>
        <el-icon @click="toggleTheme">
          <component :is="isDark ? Sunny : Moon" />
        </el-icon>
        <el-icon @click="goToPlayground"><EditPen /></el-icon>
      </div>

      <!-- 桌面端内容 -->
      <template v-else>
        <SearchBox :is-mobile="false" />
        
        <div class="nav">
          <el-menu mode="horizontal" :ellipsis="false" class="menu" :default-active="active" router>
            <el-menu-item index="/tutorial/entry/what-is-js">基础</el-menu-item>
            <el-menu-item index="/tutorial/advanced/promise">进阶</el-menu-item>
            <el-menu-item index="/tutorial/projects/todolist">练习</el-menu-item>
            <el-menu-item index="/playground">在线编辑器</el-menu-item>
          </el-menu>
        </div>
        
        <div class="theme-toggle" @click="toggleTheme">
          <el-icon v-if="!isDark" size="26" color="#525050"><Moon /></el-icon>
          <el-icon v-else size="26"><Sunny /></el-icon>
        </div>
      </template>
    </div>
    
    <!-- 移动端搜索组件 -->
    <SearchBox 
      v-if="isMobile"
      :is-mobile="true"
      :show-mobile-search="showMobileSearch"
      @close-mobile-search="closeMobileSearch"
    />
  </el-header>
</template>

<script setup>
import { Search, Sunny, Moon, Fold, Expand, EditPen } from '@element-plus/icons-vue'
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchBox from './SearchBox.vue'

const route = useRoute()
const router = useRouter()

const emit = defineEmits(['toggle-sidebar'])

const active = ref('1')
const isDark = ref(false)
const isMobile = ref(false)
const sidebarVisible = ref(false)
const showMobileSearch = ref(false)

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
  emit('toggle-sidebar')
}

const toggleTheme = () => {
  isDark.value = !isDark.value
}

const goToPlayground = () => {
  router.push('/playground')
}

const toggleMobileSearch = () => {
  showMobileSearch.value = true
}

const closeMobileSearch = () => {
  showMobileSearch.value = false
}

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    sidebarVisible.value = false
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)

  const saved = localStorage.getItem('isDark')
  if (saved === 'true') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})

watch(isDark, (val) => {
  document.documentElement.classList.toggle('dark', val)
  localStorage.setItem('isDark', val)
})
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 95px;
  width: 100%;
  padding: 0 40px;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: var(--bg-color);
  color: var(--text-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  height: 250px;
  width: 250px;
  object-fit: contain;
}

.nav {
  flex: 1;
  justify-content: center;
  border-bottom: none;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu {
  border-bottom: none !important;
  margin-right: 15px;
}

.menu .el-menu-item {
  font-size: 18px;
}

.theme-toggle {
  cursor: pointer;
}

.menu-toggle {
  cursor: pointer;
  font-size: 24px;
  color: var(--text-color);
  display: none;
}

.icon-group {
  display: none;
  align-items: center;
  gap: 20px;
  font-size: 20px;
}

.icon-group .el-icon {
  cursor: pointer;
  color: var(--text-color);
}

@media (max-width: 768px) {
  .header {
    padding: 0 20px; 
    margin: 0; 
    border: none;
    box-shadow: none; 
    width: 100%;
    position: relative;
    top: auto;
  }

  .logo {
    height: 150px;
    width: 150px;
  }

  .nav,
  .theme-toggle {
    display: none !important;
  }

  .menu-toggle,
  .icon-group {
    display: flex !important;
  }

  .menu-toggle {
    margin-left: -10px;
    font-size: 25px;
    color: #545454;
  }

  .icon-group {
    margin-right: -10px;
    font-size: 23px;
    gap: 30px;
  }
}
</style>
