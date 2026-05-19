const express = require('express');
const router = express.Router();
const EnergyReading = require('../models/EnergyReading');
const Panel = require('../models/Panel');
const { protect } = require('../middleware/auth');

// GET daily production for date range
router.get('/daily', protect, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const daily = await EnergyReading.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          totalOutput: { $sum: '$output' },
          avgEfficiency: { $avg: '$efficiency' },
          avgTemperature: { $avg: '$temperature' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const result = daily.map(d => ({
      date: `${d._id.year}-${String(d._id.month).padStart(2,'0')}-${String(d._id.day).padStart(2,'0')}`,
      energyKwh: Math.round((d.totalOutput / 1000 / 120) * 10) / 10,
      avgEfficiency: Math.round(d.avgEfficiency),
      avgTemperature: Math.round(d.avgTemperature)
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET monthly summary
router.get('/monthly', protect, async (req, res) => {
  try {
    const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const monthly = await EnergyReading.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$timestamp' }, month: { $month: '$timestamp' } },
          totalOutput: { $sum: '$output' },
          avgEfficiency: { $avg: '$efficiency' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json(monthly.map(m => ({
      period: `${m._id.year}-${String(m._id.month).padStart(2,'0')}`,
      energyKwh: Math.round(m.totalOutput / 1000 / 120),
      avgEfficiency: Math.round(m.avgEfficiency)
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET per-panel comparison
router.get('/panels-comparison', protect, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const comparison = await EnergyReading.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: '$panel',
          totalOutput: { $sum: '$output' },
          avgEfficiency: { $avg: '$efficiency' },
          avgTemperature: { $avg: '$temperature' }
        }
      },
      { $lookup: { from: 'panels', localField: '_id', foreignField: '_id', as: 'panelInfo' } },
      { $unwind: '$panelInfo' },
      { $sort: { totalOutput: -1 } }
    ]);

    res.json(comparison.map(c => ({
      panelId: c._id,
      panelName: c.panelInfo.name,
      arrayGroup: c.panelInfo.arrayGroup,
      energyKwh: Math.round(c.totalOutput / 1000 / 120 * 10) / 10,
      avgEfficiency: Math.round(c.avgEfficiency),
      avgTemperature: Math.round(c.avgTemperature)
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET overall dashboard stats
router.get('/overview', protect, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0);

    const [todayData, monthData, panels] = await Promise.all([
      EnergyReading.aggregate([
        { $match: { timestamp: { $gte: today } } },
        { $group: { _id: null, totalOutput: { $sum: '$output' }, avgEff: { $avg: '$efficiency' }, count: { $sum: 1 } } }
      ]),
      EnergyReading.aggregate([
        { $match: { timestamp: { $gte: thisMonth } } },
        { $group: { _id: null, totalOutput: { $sum: '$output' } } }
      ]),
      Panel.find()
    ]);

    const online = panels.filter(p => p.status === 'online').length;
    const warning = panels.filter(p => p.status === 'warning').length;
    const offline = panels.filter(p => p.status === 'offline').length;
    const totalCurrentOutput = panels.reduce((sum, p) => sum + (p.currentOutput || 0), 0);

    res.json({
      totalPanels: panels.length,
      online, warning, offline,
      currentOutputKw: Math.round(totalCurrentOutput / 100) / 10,
      todayEnergyKwh: Math.round((todayData[0]?.totalOutput || 0) / 1000 / 120 * 10) / 10,
      monthEnergyKwh: Math.round((monthData[0]?.totalOutput || 0) / 1000 / 120),
      avgEfficiency: Math.round(todayData[0]?.avgEff || 0),
      co2Avoided: Math.round((todayData[0]?.totalOutput || 0) / 1000 / 120 * 0.43 * 10) / 10
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
