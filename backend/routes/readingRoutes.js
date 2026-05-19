const express = require('express');
const router = express.Router();
const EnergyReading = require('../models/EnergyReading');
const Panel = require('../models/Panel');
const Alert = require('../models/Alert');
const Settings = require('../models/Settings');
const { protect } = require('../middleware/auth');

// POST add reading
router.post('/', protect, async (req, res) => {
  try {
    const { panelId, output, efficiency, temperature, voltage, current, irradiance } = req.body;

    const reading = await EnergyReading.create({ panel: panelId, output, efficiency, temperature, voltage, current, irradiance });

    // Update panel current stats
    await Panel.findByIdAndUpdate(panelId, {
      currentOutput: output,
      currentEfficiency: efficiency,
      currentTemperature: temperature,
      $inc: { totalEnergyGenerated: output / 1000 / 120 } // Convert W to kWh (per 30s)
    });

    // Auto-alert checks
    const settings = await Settings.findOne() || {};
    if (temperature > (settings.maxTemperatureThreshold || 75)) {
      await Alert.create({
        type: 'warning', category: 'temperature',
        message: `High temperature detected: ${temperature}°C`,
        panel: panelId, value: temperature, threshold: settings.maxTemperatureThreshold || 75
      });
    }
    if (efficiency < (settings.minEfficiencyThreshold || 60) && efficiency > 0) {
      await Alert.create({
        type: 'warning', category: 'efficiency',
        message: `Low efficiency: ${efficiency}% (threshold: ${settings.minEfficiencyThreshold || 60}%)`,
        panel: panelId, value: efficiency, threshold: settings.minEfficiencyThreshold || 60
      });
    }

    res.status(201).json(reading);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET readings for a panel
router.get('/panel/:panelId', protect, async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const readings = await EnergyReading.find({ panel: req.params.panelId, timestamp: { $gte: since } })
      .sort({ timestamp: 1 }).limit(500);
    res.json(readings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET today's hourly production (all panels)
router.get('/today/hourly', protect, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const hourly = await EnergyReading.aggregate([
      { $match: { timestamp: { $gte: startOfDay } } },
      { $group: { _id: { $hour: '$timestamp' }, totalOutput: { $sum: '$output' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);

    const result = Array.from({ length: 24 }, (_, i) => {
      const found = hourly.find(h => h._id === i);
      return { hour: i, output: found ? Math.round(found.totalOutput / (found.count || 1)) : 0 };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
