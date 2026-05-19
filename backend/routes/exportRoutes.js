const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const Panel = require('../models/Panel')
const EnergyReading = require('../models/EnergyReading')
const Alert = require('../models/Alert')

// GET export data as JSON (frontend will convert to PDF)
router.get('/report', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const [panels, daily, alerts] = await Promise.all([
      Panel.find(),
      EnergyReading.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: {
          _id: { year: { $year: '$timestamp' }, month: { $month: '$timestamp' }, day: { $dayOfMonth: '$timestamp' } },
          totalOutput: { $sum: '$output' }, avgEfficiency: { $avg: '$efficiency' }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      Alert.find({ createdAt: { $gte: since } }).populate('panel', 'name').sort({ createdAt: -1 }).limit(20)
    ])

    const totalKwh = daily.reduce((s, d) => s + d.totalOutput / 1000 / 120, 0)
    const avgEff = daily.length ? daily.reduce((s,d) => s + d.avgEfficiency, 0) / daily.length : 0

    res.json({
      generatedAt: new Date(),
      period: { days: Number(days), from: since, to: new Date() },
      summary: {
        totalPanels: panels.length,
        online: panels.filter(p => p.status === 'online').length,
        warning: panels.filter(p => p.status === 'warning').length,
        offline: panels.filter(p => p.status === 'offline').length,
        totalKwh: Math.round(totalKwh * 10) / 10,
        avgEfficiency: Math.round(avgEff),
        savings: Math.round(totalKwh * 0.20 * 100) / 100,
        co2Avoided: Math.round(totalKwh * 0.43 * 10) / 10
      },
      panels: panels.map(p => ({
        name: p.name, arrayGroup: p.arrayGroup, status: p.status,
        capacity: p.capacity, currentOutput: p.currentOutput || 0,
        currentEfficiency: p.currentEfficiency || 0
      })),
      daily: daily.map(d => ({
        date: `${d._id.year}-${String(d._id.month).padStart(2,'0')}-${String(d._id.day).padStart(2,'0')}`,
        energyKwh: Math.round(d.totalOutput / 1000 / 120 * 10) / 10,
        avgEfficiency: Math.round(d.avgEfficiency)
      })),
      recentAlerts: alerts.map(a => ({
        type: a.type, message: a.message,
        panel: a.panel?.name || 'System',
        date: a.createdAt
      }))
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
