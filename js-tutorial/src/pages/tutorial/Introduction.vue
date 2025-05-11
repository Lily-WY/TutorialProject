<template>
    <el-card class="tutorial-card">
      <h1>JavaScript 简介</h1>
  
      <el-divider />
  
      <p>
        JavaScript 是一种运行在浏览器中的编程语言，它主要用于为网页添加交互功能，比如点击按钮时弹出对话框、动态加载内容、表单验证等。
      </p>
  
      <p>
        它最初是为前端开发设计的，但随着 Node.js 的出现，JavaScript 也可以在服务器端运行，成为全栈开发的热门语言。
      </p>
  
      <el-alert
        title="JavaScript 是前端三大核心技术之一：HTML、CSS、JavaScript。"
        type="info"
        show-icon
        class="my-alert"
      />
  
      <h2>特性</h2>
      <ul>
        <li>解释型语言，无需编译</li>
        <li>基于事件驱动</li>
        <li>弱类型、动态语言</li>
        <li>可操作网页的 DOM 结构</li>
      </ul>
  
      <h2>示例</h2>
      <el-card class="code-block">
        <pre><code>
  &lt;button onclick="alert('你好，JavaScript!')"&gt;
    点击我
  &lt;/button&gt;
        </code></pre>
      </el-card>
    </el-card>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .tutorial-card {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
  }
  .code-block {
    background-color: #f6f8fa;
    font-family: monospace;
    white-space: pre-wrap;
    margin-top: 10px;
  }
  .my-alert {
    margin: 20px 0;
  }
  </style>
  