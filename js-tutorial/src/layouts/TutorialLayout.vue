<template>
  <div class="common-layout">
    <el-container style="height: 100vh;">
      <el-header>
        <Header />
      </el-header>

      <el-container>
        <el-aside width="220px">
          <Sidebar :section="section" :subsection="subsection" />
        </el-aside>

        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'

defineProps({
  section: String,
  subsection: String
})

import '@/styles/index.css'
</script>

<style scoped>
.common-layout {
  height: 100vh;
}
</style>
