const express = require('express')
const router = express.Router()
const Panel = require('../models/Panel')
const EnergyReading = require('../models/EnergyReading')
const Alert = require('../models/Alert')
const { protect } = require('../middleware/auth')

// GET system resources overview
router.get('/overview', protect, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0)
    const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0)

    const [panels, todayData, monthData, unreadAlerts, latestReadings] = await Promise.all([
      Panel.find(),
      EnergyReading.aggregate([
        { $match: { timestamp: { $gte: today } } },
        { $group: { _id: null, totalOutput: { $sum: '$output' }, avgEff: { $avg: '$efficiency' }, avgTemp: { $avg: '$temperature' }, count: { $sum: 1 } } }
      ]),
      EnergyReading.aggregate([
        { $match: { timestamp: { $gte: thisMonth } } },
        { $group: { _id: null, totalOutput: { $sum: '$output' } } }
      ]),
      Alert.countDocuments({ isRead: false }),
      EnergyReading.find().sort({ timestamp: -1 }).limit(1)
    ])

    const totalCapacity = panels.reduce((s, p) => s + p.capacity, 0)
    const currentOutput = panels.reduce((s, p) => s + (p.currentOutput || 0), 0)
    const online = panels.filter(p => p.status === 'online').length
    const warning = panels.filter(p => p.status === 'warning').length
    const offline = panels.filter(p => p.status === 'offline').length
    const todayKwh = Math.round((todayData[0]?.totalOutput || 0) / 1000 / 120 * 10) / 10
    const monthKwh = Math.round((monthData[0]?.totalOutput || 0) / 1000 / 120)
    const usagePercent = totalCapacity > 0 ? Math.round((currentOutput / totalCapacity) * 100) : 0

    res.json({
      panels: { total: panels.length, online, warning, offline },
      power: {
        totalCapacityKw: Math.round(totalCapacity / 100) / 10,
        currentOutputKw: Math.round(currentOutput / 100) / 10,
        usagePercent,
        availableKw: Math.round((totalCapacity - currentOutput) / 100) / 10
      },
      energy: {
        todayKwh,
        monthKwh,
        todaySavings: Math.round(todayKwh * 0.20 * 100) / 100,
        monthSavings: Math.round(monthKwh * 0.20 * 100) / 100,
        co2Today: Math.round(todayKwh * 0.43 * 10) / 10,
        co2Month: Math.round(monthKwh * 0.43)
      },
      performance: {
        avgEfficiency: Math.round(todayData[0]?.avgEff || 0),
        avgTemperature: Math.round(todayData[0]?.avgTemp || 0),
        readingsToday: todayData[0]?.count || 0
      },
      alerts: { unread: unreadAlerts },
      lastUpdated: latestReadings[0]?.timestamp || new Date()
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
