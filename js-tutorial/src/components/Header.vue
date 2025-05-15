<template>
  <el-header class="header" :class="{ dark: isDark }">
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
        <el-menu
          mode="horizontal"
          :ellipsis="false"
          class="menu"
          :default-active="active"
        >
          <el-menu-item index="1">基础</el-menu-item>
          <el-menu-item index="2">进阶</el-menu-item>
          <el-menu-item index="3">练习</el-menu-item>
          <el-menu-item index="4">讨论区</el-menu-item>
        </el-menu>
      </div>
      <div class="theme-toggle" @click="toggleTheme" style="cursor:pointer;">
        <el-icon v-if="!isDark" size="26">
           <Moon />
        </el-icon>
        <el-icon v-else size="26">
          <Sunny />
        </el-icon>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { Search, Sunny, Moon } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'

const inputValue = ref('')
const active = ref('1')

// 暗黑模式状态
const isDark = ref(false)

// 切换暗黑模式时给根元素 html 添加/移除 el-theme-dark 类名
const toggleTheme = () => {
  isDark.value = !isDark.value
}

watch(isDark, (val) => {
  const html = document.documentElement
  if (val) {
    html.classList.add('el-theme-dark')
  } else {
    html.classList.remove('el-theme-dark')
  }
})

// 页面初始根据 isDark 设置
if (isDark.value) {
  document.documentElement.classList.add('el-theme-dark')
} else {
  document.documentElement.classList.remove('el-theme-dark')
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100px;
  width: 100%;
  padding: 0 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: #fff;
  color: #000;
}

/* 暗色模式下header背景和文字颜色 */
.header.dark {
  background-color: #1f1f1f;
  color: #eee;
}

.left {
  display: flex;
  align-items: center;
}

.logo {
  height: 250px;
  width: 250px;
  margin-right: 10px;
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
  margin-top: 10px;
  margin-right: 20px;
}

.menu {
  border-bottom: none !important;
  margin-right: 15px;
}

.menu .el-menu-item {
  font-size: 18px;
}

/* 搜索框暗色样式覆盖 */
.header.dark ::v-deep(.el-input) {
  background-color: #333;
  border-color: #555;
}

.header.dark ::v-deep(.el-input__wrapper) {
  background-color: #333;
  border-color: #555;
  box-shadow: none;
}

.header.dark ::v-deep(.el-input__inner) {
  background-color: #333;
  color: #eee;
  border-color: #555;
}

.header.dark ::v-deep(.el-input__inner::placeholder) {
  color: #bbb;
}

.header.dark ::v-deep(.el-input__suffix) {
  color: #bbb;
}

.header.dark ::v-deep(.el-input__wrapper:hover) {
  border-color: #777;
}

.header.dark ::v-deep(.el-input__wrapper.is-focused) {
  border-color: #409eff;
  box-shadow: 0 0 0 1px #409eff inset;
}

/* 菜单暗色背景和文字颜色 */
.header.dark ::v-deep(.el-menu) {
  background-color: #222;
  color: #ccc;
}

.header.dark ::v-deep(.el-menu-item) {
  color: #ccc;
}

.header.dark ::v-deep(.el-menu-item:hover) {
  background-color: #444;
  color: #fff;
}

/* 保持切换图标可点击 */
.theme-toggle {
  cursor: pointer;
}

.header ::v-deep(.theme-toggle .el-icon) {
  color: rgba(0, 0, 0, 0.562); 
}

.header.dark ::v-deep(.theme-toggle .el-icon) {
  color: #eee;
}
</style>
