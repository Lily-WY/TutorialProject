<template>
  <el-menu :default-active="activePath" 
           :default-openeds="defaultOpeneds"
           class="el-menu-vertical-demo"
           active-text-color="#409EFF" 
           router 
           unique-opened>
    <template v-for="section in menu" :key="section.id">
      <!-- 每个一级目录 -->
      <el-sub-menu :index="`/tutorial/${section.id}`">
        <!-- 一级目录的标题插槽 -->
        <template #title>
          {{ section.title }}
        </template>

        <!-- 二级目录列表 -->
        <el-menu-item v-for="item in section.children" :key="item.path" :index="`/tutorial/${section.id}/${item.path}`">
          {{ item.title }}
        </el-menu-item>
      </el-sub-menu>
    </template>
  </el-menu>
</template>


<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import menu from '@/data/menu.json'
import '@/styles/index.css'

const route = useRoute()
const activePath = computed(() => route.fullPath)

// 设置默认展开的菜单项（第一个菜单）
const defaultOpeneds = computed(() => {
  const firstSection = Object.keys(menu)[0]
  return [`/tutorial/${firstSection}`]
})
</script>


<style scoped>
.el-menu {
  border-right: none;
  margin-top: 0; /* 移除上边距 */
  margin-left: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  color: var(--text-color);
  /* 固定定位，让侧边栏在滚动时保持可见 */
  position: fixed;
  top: 128px; /* 从头部下方开始 */
  left: 0;
  width: 220px; /* 设置固定宽度 */
  height: calc(100vh - 95px); /* 从头部下方到底部 */
  overflow-y: auto;
  z-index: 1000;
  background: var(--bg-color); /* 确保有背景色 */
}

/* 自定义滚动条样式 */
.el-menu::-webkit-scrollbar {
  width: 6px;
}

.el-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.el-menu::-webkit-scrollbar-thumb {
  background: #e3e3e3;
  border-radius: 3px;
}

/* Firefox 滚动条样式 */
.el-menu {
  scrollbar-width: thin;
  scrollbar-color: #d0d0d0 #f1f1f1;
}

/* 一级菜单标题字体 */
::v-deep(.el-sub-menu__title) {
  font-size: 18px;
  color: var(--text-color);
  font-family: inherit;
  padding: 0 20px !important;
  height: 56px !important;
  line-height: 56px !important;
}

/* 一级菜单标题悬停背景 */
::v-deep(.el-sub-menu__title:hover) {
  background-color: var(--hover-bg);
}

/* 子菜单项样式 */
::v-deep(.el-menu-item) {
  font-size: 17px;
  color: var(--text-color);
  font-family: inherit;
  padding: 0 20px 0 40px !important;
  height: 50px !important;
  line-height: 50px !important;
}

/* 子菜单项悬停背景 */
::v-deep(.el-menu-item:hover) {
  background-color: var(--hover-bg);
}

::v-deep(.el-menu-item.is-active) {
  background-color: var(--hover-bg) !important;
}

.el-menu,
.el-sub-menu,
.el-menu-item {
  font-family: "Times New Roman", Times, serif;
}
</style>
