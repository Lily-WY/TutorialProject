<template>
    <div class="common-layout">
        <el-container class="header">
            <!-- 导入的 Header 组件 -->
            <Header />

            <!-- <el-container>
        <el-aside width="200px">Aside</el-aside>
        <el-main>Main</el-main>
      </el-container> -->
        </el-container>
    </div>
</template>

<script setup>
import Header from '@/components/Header.vue' 
import '@/styles/index.css'
</script>

<style scoped>
  .common-layout {
      height: 100vh;
    }
  

</style>
