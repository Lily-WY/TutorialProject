<template>
  <el-menu :default-active="activePath" class="el-menu-vertical-demo"
    active-text-color="#409EFF" router unique-opened>
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
</script>


<style scoped>
.el-menu {
  border-right: none;
  margin-top: 65px;
  margin-left: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  color: var(--text-color);
}

/* 一级菜单标题字体 */
::v-deep(.el-sub-menu__title) {
  font-size: 18px;
  color: var(--text-color);
  font-family: inherit;
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
