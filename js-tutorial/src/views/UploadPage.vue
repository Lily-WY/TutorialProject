<template>
  <div class="upload-page">
    <h2>上传教程内容</h2>

    <el-form label-position="top">
      <el-form-item label="路径 (例如 what-is-js)">
        <el-input v-model="path" />
      </el-form-item>

      <el-form-item label="内容 (Markdown)">
        <el-input type="textarea" :rows="15" v-model="content" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="upload">提交</el-button>
      </el-form-item>
    </el-form>

    <div v-if="successMessage" class="success">{{ successMessage }}</div>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const path = ref('')
const content = ref('')
const successMessage = ref('')
const errorMessage = ref('')

async function upload() {
  try {
    // 首先检查内容是否存在
    const checkRes = await axios.get(`http://localhost:3000/api/tutorial/${path.value}`)

    if (checkRes.data) {
      // 内容已存在，执行更新
      const updateRes = await axios.put(`http://localhost:3000/api/tutorial/${path.value}`, {
        content: content.value
      })
      successMessage.value = '内容已更新'
    } else {
      // 内容不存在，执行创建
      const createRes = await axios.post('http://localhost:3000/api/tutorial', {
        path: path.value,
        content: content.value
      })
      successMessage.value = '新内容已创建'
    }

    errorMessage.value = ''
    path.value = ''
    content.value = ''
  } catch (err) {
    if (err.response?.status === 404) {
      // 内容不存在，执行创建
      try {
        const createRes = await axios.post('http://localhost:3000/api/tutorial', {
          path: path.value,
          content: content.value
        })
        successMessage.value = '新内容已创建'
        errorMessage.value = ''
        path.value = ''
        content.value = ''
        return
      } catch (createErr) {
        errorMessage.value = '创建失败：' + (createErr.response?.data?.message || createErr.message)
      }
    } else {
      errorMessage.value = '操作失败：' + (err.response?.data?.message || err.message)
    }
    successMessage.value = ''
  }
}
</script>

<style scoped>
.upload-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
}

.success {
  color: green;
  margin-top: 20px;
}

.error {
  color: red;
  margin-top: 20px;
}
</style>
