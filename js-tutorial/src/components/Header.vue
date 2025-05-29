<template>
  <el-header class="header">
    <div class="left">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
    </div>
    <div class="right">
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
    </div>
  </el-header>
</template>

<script setup>
import { Search, Sunny, Moon } from '@element-plus/icons-vue'
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const inputValue = ref('')
const active = ref('1')
const isDark = ref(false) // 默认是浅色

// 页面加载时判断本地存储是否保存了深色主题
onMounted(() => {
  const saved = localStorage.getItem('isDark')
  if (saved === 'true') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})

// 监听 isDark 变化，动态添加/移除 .dark 类，并保存状态
watch(isDark, (val) => {
  const html = document.documentElement
  html.classList.toggle('dark', val)
  localStorage.setItem('isDark', val)
})

// 点击切换主题
const toggleTheme = () => {
  isDark.value = !isDark.value
}
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
}

.logo {
  height: 250px;
  width: 250px;
  margin-right: 10px;
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
</style>
