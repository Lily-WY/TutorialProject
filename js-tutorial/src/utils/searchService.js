// 简单搜索服务 - 只搜索侧边栏标题
export class SearchService {
  constructor() {
    this.searchData = []
    this.initialized = false
  }

  // 初始化搜索数据
  async initializeIndex() {
    if (this.initialized) return
    
    try {
      // 导入菜单数据
      const menuModule = await import('@/data/menu.json')
      const menuData = menuModule.default || menuModule
      
      // 扁平化菜单数据
      this.searchData = this.flattenMenuData(menuData)
      this.initialized = true
      console.log('搜索数据初始化完成:', this.searchData)
    } catch (error) {
      console.error('搜索数据初始化失败:', error)
    }
  }

  // 将嵌套菜单数据扁平化
  flattenMenuData(menuData) {
    const flatData = []
    
    menuData.forEach(section => {
      if (section.children) {
        section.children.forEach(item => {
          flatData.push({
            id: `${section.id}-${item.path}`,
            title: item.title,
            category: section.title,
            path: `/tutorial/${section.id}/${item.path}`,
            breadcrumb: `${section.title} > ${item.title}`,
            type: 'article'
          })
        })
        
        // 也添加分类标题到搜索
        flatData.push({
          id: `category-${section.id}`,
          title: section.title,
          category: '分类',
          path: `/tutorial/${section.id}/${section.children[0]?.path || ''}`,
          breadcrumb: section.title,
          type: 'category'
        })
      }
    })
    
    return flatData
  }

  // 搜索功能
  search(query, limit = 10) {
    if (!query.trim() || !this.initialized) return []
    
    const keyword = query.toLowerCase()
    
    // 过滤匹配的结果
    const results = this.searchData.filter(item => {
      return item.title.toLowerCase().includes(keyword) ||
             item.category.toLowerCase().includes(keyword)
    })
    
    // 排序：分类优先，然后按标题匹配度排序
    return results.sort((a, b) => {
      // 分类优先
      if (a.type === 'category' && b.type !== 'category') return -1
      if (a.type !== 'category' && b.type === 'category') return 1
      
      // 完全匹配优先
      const aExact = a.title.toLowerCase() === keyword
      const bExact = b.title.toLowerCase() === keyword
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      
      // 开头匹配优先
      const aStartsWith = a.title.toLowerCase().startsWith(keyword)
      const bStartsWith = b.title.toLowerCase().startsWith(keyword)
      if (aStartsWith && !bStartsWith) return -1
      if (!aStartsWith && bStartsWith) return 1
      
      return 0
    }).slice(0, limit)
  }
}

export const searchService = new SearchService()