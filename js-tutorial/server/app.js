const express = require('express')
const cors = require('cors')
const tutorialRoutes = require('./routes/tutorialRoutes')

const app = express()

app.use(cors())
app.use(express.json())

// 只保留这一句挂载
app.use('/api/tutorial', tutorialRoutes)

const PORT = 3000
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
})
