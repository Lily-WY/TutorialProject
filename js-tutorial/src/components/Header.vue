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

      <!-- 桌面端内容（原样保留） -->
      <template v-else>
        <el-input
          v-model="inputValue"
          placeholder="请输入搜索内容"
          :suffix-icon="Search"
          size="large"
          class="search-box"
        />
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
    
    <!-- 移动端搜索框覆盖层 -->
    <div v-if="showMobileSearch" class="mobile-search-overlay" @click="closeMobileSearch">
      <div class="mobile-search-container" @click.stop>
        <el-input
          v-model="inputValue"
          placeholder="请输入搜索内容"
          size="large"
          class="mobile-search-input"
          autofocus
        />
        <el-button @click="closeMobileSearch" type="text">取消</el-button>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { Search, Sunny, Moon, Fold, Expand, EditPen } from '@element-plus/icons-vue'
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 定义 emit
const emit = defineEmits(['toggle-sidebar'])

const inputValue = ref('')
const active = ref('1')
const isDark = ref(false)
const isMobile = ref(false)
const sidebarVisible = ref(false)
const showMobileSearch = ref(false)

// 切换侧边栏 - 通过 emit 传递事件给父组件
const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
  emit('toggle-sidebar')
  console.log('侧边栏切换:', sidebarVisible.value) // 调试用
}

// 主题切换
const toggleTheme = () => {
  isDark.value = !isDark.value
}

const goToPlayground = () => {
  router.push('/playground')
}

// 移动端搜索
const toggleMobileSearch = () => {
  showMobileSearch.value = true
}

const closeMobileSearch = () => {
  showMobileSearch.value = false
}

// 监听窗口宽度，判断是否为手机
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  // 移动端默认隐藏侧边栏
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

.search-box {
  width: 700px;
  font-size: 15px;
  margin-top: 6px;
  margin-right: 20px;
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

/* 移动端搜索覆盖层 */
.mobile-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  padding-top: 95px;
}

.mobile-search-container {
  width: 100%;
  background: var(--bg-color);
  padding: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.mobile-search-input {
  flex: 1;
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

  .search-box,
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
