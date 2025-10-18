<template>
  <nav class="sidebar">
    <el-menu
      :default-active="activePath"
      :default-openeds="defaultOpeneds"
      class="el-menu-vertical-demo"
      active-text-color="#409EFF"
      router
      unique-opened
    >
      <template v-for="section in menu" :key="section.id">
        <el-sub-menu :index="`/tutorial/${section.id}`">
          <template #title>
            {{ section.title }}
          </template>

          <el-menu-item
            v-for="item in section.children"
            :key="item.path"
            :index="`/tutorial/${section.id}/${item.path}`"
          >
            {{ item.title }}
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import menu from '@/data/menu.json'
import '@/styles/index.css'

const route = useRoute()

/**
 * 当前激活的路径，用于菜单高亮
 * Current active path for menu highlighting
 */
const activePath = computed(() => route.path)

/**
 * 默认展开的菜单项
 * 兼容 menu 为数组或对象两种格式，自动展开第一个一级目录
 * 
 * Default opened menu items
 * Compatible with both array and object menu formats, auto-opens first top-level section
 */
const defaultOpeneds = computed(() => {
  if (!menu) return []
  
  if (Array.isArray(menu)) {
    if (menu.length === 0) return []
    return [`/tutorial/${menu[0].id}`]
  }
  
  const keys = Object.keys(menu)
  if (keys.length === 0) return []
  return [`/tutorial/${keys[0]}`]
})
</script>

<style scoped>
/**
 * 侧边栏容器
 * 使用高优先级选择器覆盖 Element Plus 默认样式，避免使用 !important
 * 
 * Sidebar container
 * Uses high-specificity selectors to override Element Plus defaults without !important
 */
.sidebar {
  position: fixed;
  top: 128px;
  left: 0;
  width: 220px;
  height: calc(100vh - 128px);
  overflow-y: auto;
  z-index: 1000;
  background: var(--bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  color: var(--text-color);
  margin-top: 0;
  margin-left: 20px;
  font-family: "Times New Roman", Times, serif;
}

/**
 * 菜单基础样式
 * Basic menu styles
 */
.sidebar > .el-menu {
  border-right: none;
  box-shadow: none;
  color: inherit;
  background: transparent;
  width: 100%;
  height: 100%;
  padding: 0;
  scrollbar-width: thin;
  scrollbar-color: #d0d0d0 #f1f1f1;
}

/**
 * 滚动条样式 - WebKit 浏览器（Chrome, Safari, Edge）
 * Scrollbar styles for WebKit browsers
 */
.sidebar .el-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar .el-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.sidebar .el-menu::-webkit-scrollbar-thumb {
  background: #e3e3e3;
  border-radius: 3px;
}

.sidebar .el-menu::-webkit-scrollbar-thumb:hover {
  background: #d0d0d0;
}

/**
 * 暗色模式滚动条
 * Dark mode scrollbar
 */
:root.dark .sidebar .el-menu::-webkit-scrollbar-track {
  background: #2d2d2d;
}

:root.dark .sidebar .el-menu::-webkit-scrollbar-thumb {
  background: #4a4a4a;
}

:root.dark .sidebar .el-menu::-webkit-scrollbar-thumb:hover {
  background: #5a5a5a;
}

:root.dark .sidebar > .el-menu {
  scrollbar-color: #4a4a4a #2d2d2d;
}

/**
 * 一级菜单标题样式
 * Top-level menu title styles
 */
.sidebar :deep(.el-sub-menu__title) {
  font-size: 18px;
  color: var(--text-color);
  padding-left: 20px;
  padding-right: 20px;
  height: 56px;
  line-height: 56px;
}

.sidebar :deep(.el-sub-menu__title:hover) {
  background-color: var(--hover-bg);
}

/**
 * 二级菜单项样式
 * Second-level menu item styles
 */
.sidebar :deep(.el-menu-item) {
  font-size: 17px;
  color: var(--text-color);
  padding-left: 40px;
  padding-right: 20px;
  height: 50px;
  line-height: 50px;
}

.sidebar :deep(.el-menu-item:hover),
.sidebar :deep(.el-menu-item.is-active) {
  background-color: var(--hover-bg);
}

/**
 * 平板及手机端适配（≤768px）
 * 改为静态布局，增大触控区域以提升移动端体验
 * 
 * Tablet and mobile adaptation (≤768px)
 * Changes to static layout with larger touch targets for better mobile UX
 */
@media (max-width: 768px) {
  .sidebar {
    position: static;
    margin-top: 20px;
    margin-left: 0;
    margin-right: 0;
    width: 100%;
    height: auto;
    min-height: 50vh;
    box-shadow: none;
    padding: 0 15px;
  }

  .sidebar :deep(.el-sub-menu__title) {
    font-size: 18px;
    height: 60px;
    line-height: 60px;
    padding-left: 25px;
    padding-right: 25px;
  }

  .sidebar :deep(.el-menu-item) {
    font-size: 17px;
    height: 55px;
    line-height: 55px;
    padding-left: 45px;
    padding-right: 25px;
  }
}

/**
 * 小屏手机适配（≤480px）
 * Small mobile adaptation (≤480px)
 */
@media (max-width: 480px) {
  .sidebar {
    padding: 0 10px;
  }

  .sidebar :deep(.el-sub-menu__title) {
    font-size: 20px;
    height: 55px;
    line-height: 55px;
    padding-left: 20px;
    padding-right: 20px;
  }

  .sidebar :deep(.el-menu-item) {
    font-size: 18px;
    height: 50px;
    line-height: 50px;
    padding-left: 40px;
    padding-right: 20px;
  }
}
</style>
