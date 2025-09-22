<template>
  <div class="search-container" :class="{ 'mobile': isMobile }">
    <!-- 移动端搜索遮罩 -->
    <div 
      v-if="isMobile && showMobileSearch" 
      class="mobile-search-overlay"
      @click="closeMobileSearch"
    >
      <div class="mobile-search-content" @click.stop>
        <div class="mobile-search-header">
          <el-input
            ref="searchInputRef"
            v-model="searchQuery"
            placeholder="搜索教程内容..."
            size="large"
            @keyup.enter="handleSearch"
            @input="handleInput"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button @click="closeMobileSearch" text>
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        
        <!-- 移动端搜索结果 -->
        <div class="search-results-container">
          <div class="search-results">
            <!-- 加载状态 -->
            <div v-if="isLoading" class="loading-state">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>搜索中...</span>
            </div>
            
            <!-- 无结果 -->
            <div v-else-if="searchResults.length === 0 && searchQuery.trim()" class="no-results">
              <el-icon><DocumentRemove /></el-icon>
              <span>未找到 "{{ searchQuery }}" 相关内容</span>
            </div>
            
            <!-- 搜索结果列表 -->
            <div v-else class="results-list">
              <div 
                v-for="result in searchResults" 
                :key="result.id"
                class="result-item"
                @click="handleSelectResult(result)"
              >
                <div class="result-header">
                  <div class="result-title-wrapper">
                    <h4 class="result-title" v-html="highlightText(result.title, searchQuery)"></h4>
                  </div>
                  <span class="result-category-text">{{ result.sectionTitle }}</span>
                </div>
                <div class="result-snippet" v-html="highlightText(result.snippet, searchQuery)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 桌面端搜索 -->
    <div v-else class="desktop-search">
      <el-input
        ref="searchInputRef"
        v-model="searchQuery"
        placeholder="搜索教程内容..."
        style="width: 700px; height: 40px;"
        @focus="showResults = true"
        @blur="handleBlur"
        @keyup.enter="handleSearch"
        @input="handleInput"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <!-- 桌面端搜索结果下拉框 -->
      <div v-if="showResults && (searchResults.length > 0 || isLoading || showEmptyState)" class="search-dropdown">
        <div class="search-results">
          <!-- 加载状态 -->
          <div v-if="isLoading" class="loading-state">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>搜索中...</span>
          </div>
          
          <!-- 无结果 -->
          <div v-else-if="searchResults.length === 0 && searchQuery.trim()" class="no-results">
            <el-icon><DocumentRemove /></el-icon>
            <span>未找到 "{{ searchQuery }}" 相关内容</span>
          </div>
          
          <!-- 搜索结果列表 -->
          <div v-else class="results-list">
            <div 
              v-for="result in searchResults" 
              :key="result.id"
              class="result-item"
              @click="handleSelectResult(result)"
            >
              <div class="result-header">
                <div class="result-title-wrapper">
                  <h4 class="result-title" v-html="highlightText(result.title, searchQuery)"></h4>
                </div>
                <span class="result-category-text">{{ result.sectionTitle }}</span>
              </div>
              <div class="result-snippet" v-html="highlightText(result.snippet, searchQuery)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Close, Loading, DocumentRemove } from '@element-plus/icons-vue'

const props = defineProps({
  isMobile: Boolean,
  showMobileSearch: Boolean
})

const emit = defineEmits(['close-mobile-search'])

const router = useRouter()
const searchInputRef = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const isLoading = ref(false)
const showResults = ref(false)

const showEmptyState = computed(() => {
  return searchQuery.value.trim() && !isLoading.value && searchResults.value.length === 0
})

// 防抖函数
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 搜索函数
const searchTutorials = async (query, limit = 8) => {
  try {
    const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&limit=${limit}`)
    if (!response.ok) throw new Error('搜索失败')
    return await response.json()
  } catch (error) {
    console.error('搜索失败:', error)
    throw error
  }
}

// 防抖搜索
const debouncedSearch = debounce(async (query) => {
  if (!query.trim()) {
    searchResults.value = []
    showResults.value = false
    return
  }
  
  isLoading.value = true
  
  try {
    const results = await searchTutorials(query)
    console.log('搜索结果:', results) // 调试用
    searchResults.value = results.map(item => ({
      ...item,
      url: `/tutorial${item.path}` // 添加路由路径
    }))
    showResults.value = true
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}, 300)

// 高亮搜索关键词
const highlightText = (text, query) => {
  if (!query || !text) return text
  
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 转义正则表达式特殊字符
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const handleInput = (value) => {
  if (value.trim()) {
    debouncedSearch(value)
  } else {
    searchResults.value = []
    showResults.value = false
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
    closeMobileSearch()
  }
}

const handleSelectResult = (result) => {
  router.push(result.url)
  closeMobileSearch()
  showResults.value = false
  searchQuery.value = ''
}

const handleBlur = () => {
  setTimeout(() => {
    showResults.value = false
  }, 200)
}

const closeMobileSearch = () => {
  emit('close-mobile-search')
  searchQuery.value = ''
  searchResults.value = []
  showResults.value = false
}

watch(() => props.showMobileSearch, (show) => {
  if (show) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
})
</script>

<style scoped>
.search-container {
  position: relative;
}

.desktop-search {
  position: relative;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  margin-top: 4px;
}

.mobile-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  padding-top: 60px;
}

.mobile-search-content {
  background: var(--bg-color);
  width: 100%;
  max-height: 80vh;
  border-radius: 12px 12px 0 0;
  display: flex;
  flex-direction: column;
}

.mobile-search-header {
  padding: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.mobile-search-header .el-input {
  flex: 1;
}

.search-results-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

/* 搜索结果样式 - 恢复之前的样式 */
.search-results {
  min-height: 60px;
}

.loading-state, .no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: var(--text-color-secondary);
  font-size: 14px;
}

.results-list {
  padding: 8px 0;
}

.result-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color-light);
  transition: background-color 0.2s;
}

.result-item:hover {
  background-color: var(--hover-bg-color, rgba(0, 0, 0, 0.05));
}

.result-item:last-child {
  border-bottom: none;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 12px;
}

.result-title-wrapper {
  flex: 1;
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  color: white;  /* 改为白色文字 */
  margin: 0;
  line-height: 1.3;
  background-color: var(--primary-color, #8addff);  /* 改为主题蓝色 */
  padding: 6px 8px;
  border-radius: 6px;
  display: inline-block;
}

.result-category-text {
  color: var(--text-color-secondary, #666);
  font-size: 12px;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: center;
}

.result-snippet {
  font-size: 14px;
  color: var(--text-color-secondary);
  line-height: 1.5;
  margin-bottom: 0;
}

/* 暗色模式适配 */
:root.dark .result-title {
  background-color: var(--primary-color, #409eff);  /* 暗色模式也使用主题蓝色 */
  color: white;
}

:deep(mark) {
  background-color: #fff3cd;
  color: #856404;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: 600;
}

/* 暗色模式下的高亮样式 */
:root.dark :deep(mark) {
  background-color: #664d03;
  color: #fff3cd;
}
</style>