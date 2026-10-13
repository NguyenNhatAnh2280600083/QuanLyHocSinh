const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const commonRoutes = require('./routes/common')
const studentsRoutes = require('./routes/students')
const teachersRoutes = require('./routes/teachers')
const classesRoutes = require('./routes/classes')
const scoresRoutes = require('./routes/scores')
const attendanceRoutes = require('./routes/attendance')
const rewardsRoutes = require('./routes/rewards')
const accountsRoutes = require('./routes/accounts')
const authRoutes = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server đang chạy' })
})

app.use('/api', commonRoutes)
app.use('/api', studentsRoutes)
app.use('/api', teachersRoutes)
app.use('/api', classesRoutes)
app.use('/api', scoresRoutes)
app.use('/api', attendanceRoutes)
app.use('/api', rewardsRoutes)
app.use('/api', accountsRoutes)
app.use('/api', authRoutes)

app.use((err, req, res, next) => {
  console.error('Lỗi server:', err.message)
  res.status(500).json({ error: err.message })
})

app.listen(PORT, () => {
  console.log(`🚀 Backend server chạy tại http://localhost:${PORT}`)
})
