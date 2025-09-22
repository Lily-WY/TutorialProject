// server/routes/search.js
const express = require('express')
const router = express.Router()
const db = require('../db')
const fs = require('fs')
const path = require('path')

// 缓存 menu 数据
let menuCache = null

function getMenuData() {
  if (!menuCache) {
    try {
      const menuPath = path.join(__dirname, '../../src/data/menu.json')
      const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'))
      
      const pathMap = {}
      const categoryMap = {}
      
      menuData.forEach(section => {
        section.children?.forEach(item => {
          pathMap[item.path] = `/${section.id}/${item.path}`
          categoryMap[item.path] = {
            title: item.title,
            category: section.title,
            sectionId: section.id
          }
        })
      })
      
      menuCache = { pathMap, categoryMap, menuData }
    } catch (error) {
      console.error('读取 menu.json 失败:', error)
      menuCache = { pathMap: {}, categoryMap: {}, menuData: [] }
    }
  }
  return menuCache
}

// 搜索接口
router.get('/search', async (req, res) => {
  try {
    const { query, limit = 20 } = req.query
    
    if (!query?.trim()) {
      return res.json([])
    }
    
    const searchTerm = query.trim()
    const searchTermLike = `%${searchTerm}%`
    
    // 获取所有数据库内容
    const [results] = await db.execute(`
      SELECT 
        id, 
        path, 
        content
      FROM tutorial_contents 
      WHERE path LIKE ? OR content LIKE ?
      ORDER BY id DESC
      LIMIT ?
    `, [searchTermLike, searchTermLike, parseInt(limit)])
    
    const { pathMap, categoryMap } = getMenuData()
    
    // 计算相关性分数并处理结果
    const processedResults = results.map(item => {
      const menuInfo = categoryMap[item.path] || {}
      const fullPath = pathMap[item.path] || `/${item.path}`
      
      let relevanceScore = 0
      const queryLower = searchTerm.toLowerCase()
      
      // 1. 检查菜单标题匹配 (最高优先级)
      if (menuInfo.title) {
        const titleLower = menuInfo.title.toLowerCase()
        if (titleLower === queryLower) {
          relevanceScore += 1000  // 完全匹配
        } else if (titleLower.includes(queryLower)) {
          relevanceScore += 500   // 部分匹配
        }
      }
      
      // 2. 检查内容中的markdown标题匹配
      const contentTitleMatch = item.content.match(/^#\s+(.+)$/m)
      if (contentTitleMatch) {
        const contentTitle = contentTitleMatch[1].toLowerCase()
        if (contentTitle.includes(queryLower)) {
          relevanceScore += 300
        }
      }
      
      // 3. 检查路径匹配
      if (item.path.toLowerCase().includes(queryLower)) {
        relevanceScore += 100
      }
      
      // 4. 检查内容匹配
      const contentLower = item.content.toLowerCase()
      if (contentLower.includes(queryLower)) {
        relevanceScore += 10
        
        // 如果在内容开头出现，额外加分
        const firstParagraph = item.content.substring(0, 200).toLowerCase()
        if (firstParagraph.includes(queryLower)) {
          relevanceScore += 20
        }
      }
      
      return {
        id: item.id,
        path: fullPath,
        title: menuInfo.title || extractTitleFromContent(item.content) || item.path.replace(/-/g, ' '),
        category: menuInfo.category || '其他',
        sectionTitle: menuInfo.category || '其他',  // 大分类标题
        articleTitle: menuInfo.title || extractTitleFromContent(item.content) || item.path.replace(/-/g, ' '), // 小标题
        content: item.content,
        relevance_score: relevanceScore,
        snippet: createSnippet(item.content, searchTerm)
      }
    })
    
    // 现在也要包含只匹配菜单标题但数据库中没有对应内容的项
    const { menuData } = getMenuData()
    const menuOnlyResults = []
    
    menuData.forEach(section => {
      section.children?.forEach(item => {
        const titleLower = item.title.toLowerCase()
        const queryLower = searchTerm.toLowerCase()
        
        // 检查是否已经在数据库结果中
        const existsInDb = results.some(dbItem => dbItem.path === item.path)
        
        if (!existsInDb && titleLower.includes(queryLower)) {
          let score = 0
          if (titleLower === queryLower) {
            score = 1000
          } else if (titleLower.includes(queryLower)) {
            score = 500
          }
          
          menuOnlyResults.push({
            id: `menu-${section.id}-${item.path}`,
            path: `/${section.id}/${item.path}`,
            title: item.title,
            category: section.title,
            sectionTitle: section.title,
            articleTitle: item.title,
            content: '',
            relevance_score: score,
            snippet: `这是《${item.title}》教程的内容...`
          })
        }
      })
    })
    
    // 合并结果并排序
    const allResults = [...processedResults, ...menuOnlyResults]
      .filter(item => item.relevance_score > 0)
      .sort((a, b) => {
        if (b.relevance_score !== a.relevance_score) {
          return b.relevance_score - a.relevance_score
        }
        return (typeof b.id === 'number' ? b.id : 0) - (typeof a.id === 'number' ? a.id : 0)
      })
    
    res.json(allResults)
    
  } catch (error) {
    console.error('搜索失败:', error)
    res.status(500).json({ error: '搜索服务出错' })
  }
})

// 从内容中提取标题
function extractTitleFromContent(content) {
  const titleMatch = content.match(/^#\s+(.+)$/m)
  if (titleMatch) {
    return titleMatch[1].replace(/[✨🚀📌💡🔍✅🧠🧩🖊️📦📍🧪]/g, '').trim()
  }
  return null
}

// 创建搜索摘要 - 优化版本
function createSnippet(content, query) {
  if (!content) return ''
  
  // 移除markdown格式
  const plainText = content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '[代码块]')
    .replace(/\n+/g, ' ')
    .trim()
  
  const queryLower = query.toLowerCase()
  const textLower = plainText.toLowerCase()
  
  // 尝试找到包含关键词的句子
  const sentences = plainText.split(/[。！？.!?]/g).filter(s => s.trim().length > 0)
  const matchingSentence = sentences.find(sentence => 
    sentence.toLowerCase().includes(queryLower)
  )
  
  if (matchingSentence) {
    let snippet = matchingSentence.trim()
    if (snippet.length > 150) {
      const index = snippet.toLowerCase().indexOf(queryLower)
      const start = Math.max(0, index - 50)
      const end = Math.min(snippet.length, index + query.length + 50)
      snippet = snippet.substring(start, end)
      
      if (start > 0) snippet = '...' + snippet
      if (end < matchingSentence.length) snippet = snippet + '...'
    }
    return snippet
  }
  
  // 如果没有找到匹配的句子，使用原来的方法
  const index = textLower.indexOf(queryLower)
  if (index === -1) {
    return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText
  }
  
  const start = Math.max(0, index - 50)
  const end = Math.min(plainText.length, index + query.length + 70)
  let snippet = plainText.substring(start, end)
  
  if (start > 0) snippet = '...' + snippet
  if (end < plainText.length) snippet = snippet + '...'
  
  return snippet
}

// 搜索建议接口
router.get('/search/suggestions', async (req, res) => {
  try {
    const { query } = req.query
    
    if (!query?.trim() || query.length < 2) {
      return res.json([])
    }
    
    const { categoryMap } = getMenuData()
    const queryLower = query.toLowerCase()
    
    // 从菜单中获取建议
    const suggestions = []
    Object.entries(categoryMap).forEach(([path, info]) => {
      if (info.title.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: info.title,
          path: `/${info.sectionId}/${path}`,
          category: info.category,
          type: 'title'
        })
      }
    })
    
    res.json(suggestions.slice(0, 5))
    
  } catch (error) {
    console.error('获取建议失败:', error)
    res.status(500).json({ error: '获取建议失败' })
  }
})

module.exports = router