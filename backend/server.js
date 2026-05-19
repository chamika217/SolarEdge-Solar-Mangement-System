const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const dotenv = require('dotenv')
const cron = require('node-cron')

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET','POST'] }
})

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }))
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/panels', require('./routes/panelRoutes'))
app.use('/api/readings', require('./routes/readingRoutes'))
app.use('/api/alerts', require('./routes/alertRoutes'))
app.use('/api/analytics', require('./routes/analyticsRoutes'))
app.use('/api/settings', require('./routes/settingsRoutes'))
app.use('/api/audit', require('./routes/auditRoutes'))
app.use('/api/export', require('./routes/exportRoutes'))
app.use('/api/billing', require('./routes/billingRoutes'))
app.use('/api/resources', require('./routes/resourceRoutes'))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err))

const Panel = require('./models/Panel')

io.on('connection', socket => {
  console.log('Client connected:', socket.id)
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id))
})

// Real-time data every 30 seconds
cron.schedule('*/30 * * * * *', async () => {
  try {
    const panels = await Panel.find({ status: { $ne: 'offline' } })
    if (!panels.length) return
    const hour = new Date().getHours()
    const sunFactor = Math.max(0, Math.sin((hour - 6) * Math.PI / 12))
    const liveData = panels.map(panel => {
      const base = panel.capacity * sunFactor * (0.7 + Math.random() * 0.25)
      const output = Math.round(panel.status === 'warning' ? base * 0.5 : base)
      return {
        panelId: panel._id,
        panelName: panel.name,
        output,
        efficiency: Math.round((output / panel.capacity) * 100),
        temperature: Math.round(35 + Math.random() * 15),
        voltage: Math.round(380 + Math.random() * 40),
        current: Math.round((output / 400) * 10) / 10
      }
    })
    const totalOutput = liveData.reduce((s, p) => s + p.output, 0)
    io.emit('liveData', { panels: liveData, totalOutput, timestamp: new Date() })
  } catch (err) { console.error('Live data error:', err.message) }
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
