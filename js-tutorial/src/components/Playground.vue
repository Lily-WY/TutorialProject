<template>
  <div class="playground">
    <div class="editor-container">
      <div class="code-section">
        <div class="toolbar">
          <span>JavaScript</span>
          <div class="actions">
            <el-button size="small" @click="runCode" :loading="isLoading">
              <el-icon><VideoPlay /></el-icon> 运行
            </el-button>
            <el-button size="small" @click="clearCode">
              <el-icon><Delete /></el-icon> 清空
            </el-button>
          </div>
        </div>
        <div ref="editorContainer" class="editor"></div>
      </div>
      <div class="output-section">
        <div class="output-header">输出结果</div>
        <div class="output-content" :class="{ 'error': isError }">
          <template v-if="outputLines.length">
            <div v-for="(line, index) in outputLines" :key="index">{{ line }}</div>
          </template>
          <div v-else>点击"运行"按钮查看输出结果</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as monaco from 'monaco-editor'
import { useWindowSize } from '@vueuse/core'
import { VideoPlay, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const { width, height } = useWindowSize()
const editorContainer = ref(null)
const editorInstance = ref(null)
const isLoading = ref(false)
const isError = ref(false)
const outputLines = ref([])
const code = ref('// 在这里输入你的JavaScript代码\nconsole.log("Hello World!");')

onMounted(() => {
  if (editorContainer.value) {
    editorInstance.value = monaco.editor.create(editorContainer.value, {
      value: code.value,
      language: 'javascript',
      theme: 'vs-dark',
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      lineNumbers: 'on',
      padding: { top: 10 }
    })

    editorInstance.value.onDidChangeModelContent(() => {
      code.value = editorInstance.value.getValue()
    })
  }
})

onBeforeUnmount(() => {
  if (editorInstance.value) {
    editorInstance.value.dispose()
  }
})

const runCode = async () => {
  if (!editorInstance.value) {
    ElMessage.error('编辑器未就绪')
    return
  }

  try {
    isLoading.value = true
    isError.value = false
    outputLines.value = []

    const console = {
      log: (...args) => {
        outputLines.value.push(
          args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ')
        )
      },
      error: (...args) => {
        isError.value = true
        outputLines.value.push('Error: ' + args.join(' '))
      }
    }

    await new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        isError.value = true
        outputLines.value.push('Error: 代码执行超时')
        resolve()
      }, 3000)

      try {
        new Function('console', code.value)(console)
        clearTimeout(timeoutId)
        resolve()
      } catch (err) {
        clearTimeout(timeoutId)
        console.error(err.message)
        resolve()
      }
    })
  } catch (err) {
    isError.value = true
    outputLines.value = ['Error: ' + err.message]
    ElMessage.error('代码执行出错')
  } finally {
    isLoading.value = false
  }
}

const clearCode = () => {
  if (editorInstance.value) {
    editorInstance.value.setValue('// 在这里输入你的JavaScript代码\n')
    outputLines.value = []
    isError.value = false
    ElMessage.success('已清空代码和输出')
  }
}
</script>

<style scoped>
.playground {
  padding: 20px;
  height: calc(100vh - 120px);
}

.editor-container {
  display: flex;
  gap: 20px;
  height: 100%;
}

.code-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #2d2d2d;
  color: #fff;
  z-index: 1;
}

.actions {
  display: flex;
  gap: 8px;
}

.editor {
  flex: 1;
  height: calc(100vh - 200px);
}

.output-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.output-header {
  padding: 8px 16px;
  background-color: #f6f8fa;
  border-bottom: 1px solid #ddd;
}

.output-content {
  flex: 1;
  padding: 16px;
  font-family: Monaco, monospace;
  white-space: pre-wrap;
  overflow-y: auto;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.output-content.error {
  color: #ff4d4f;
}
</style>