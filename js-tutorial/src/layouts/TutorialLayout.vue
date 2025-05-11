<template>
    <Suspense>
        <component :is="component" />
    </Suspense>
    <el-container style="height: 100vh;">
        <!-- 左侧边栏 -->
        <el-aside width="260px" class="sidebar">
            <el-scrollbar>
                <el-menu class="el-menu-vertical" :default-active="currentSection" router>
                    <el-menu-item v-for="item in chapters" :key="item.path" :index="`/tutorial/${item.path}`">
                        {{ item.title }}
                    </el-menu-item>
                </el-menu>
            </el-scrollbar>
        </el-aside>

        <!-- 右侧内容 -->
        <el-container>
            <el-header class="header">
                <h2>JavaScript 教程</h2>
            </el-header>
            <el-main class="main">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'



// 读取当前路径的 section 参数
const route = useRoute()
const section = computed(() => route.params.section)

// 动态加载对应教程组件
const component = computed(() => {
    if (!section.value) return null
    const name = section.value.charAt(0).toUpperCase() + section.value.slice(1)
    return defineAsyncComponent(() => import(`@/pages/tutorial/${name}.vue`))
})
</script>

<style scoped>
.sidebar {
    background-color: #f8f9fa;
    border-right: 1px solid #ddd;
}

.header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    background-color: #ffffff;
}

.main {
    padding: 24px;
    overflow-y: auto;
    background-color: #fff;
}
</style>