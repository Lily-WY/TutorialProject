<template>
  <el-header class="header">
    <div class="left">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
    </div>

    <div class="right">
      <el-input v-model="inputValue" placeholder="请输入搜索内容" :suffix-icon="Search" size="large" class="search-box" />
      <div class="theme-toggle" @click="toggleTheme">
        <el-icon v-if="!isDark" size="24">
          <Sunny />
        </el-icon>
        <el-icon v-else size="24">
          <Moon />
        </el-icon>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { Sunny, Moon } from '@element-plus/icons-vue'

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
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
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
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
}

.theme-toggle {
  margin: 20px;
  cursor: pointer;
  color: grey; 
}
</style>
