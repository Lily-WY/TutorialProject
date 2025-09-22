const express = require('express')
const cors = require('cors')
const tutorialRoutes = require('./routes/tutorialRoutes')
const searchRoutes = require('./routes/search')  // 添加这行

const app = express()

// 中间件配置 / Middleware configuration
app.use(cors()) // 允许跨域请求
app.use(express.json()) // 解析 JSON 请求体

// 路由配置 / Route configuration
app.use('/api/tutorial', tutorialRoutes)
app.use('/api', searchRoutes)  // 添加这行

// 启动服务器 / Start server
const PORT = 3000
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
})
