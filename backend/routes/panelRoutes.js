const express = require('express');
const router = express.Router();
const Panel = require('../models/Panel');
const Alert = require('../models/Alert');
const { protect } = require('../middleware/auth');

// GET all panels
router.get('/', protect, async (req, res) => {
  try {
    const panels = await Panel.find().sort({ createdAt: -1 });
    res.json(panels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single panel
router.get('/:id', protect, async (req, res) => {
  try {
    const panel = await Panel.findById(req.params.id);
    if (!panel) return res.status(404).json({ message: 'Panel not found' });
    res.json(panel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create panel
router.post('/', protect, async (req, res) => {
  try {
    const panel = await Panel.create(req.body);
    res.status(201).json(panel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update panel
router.put('/:id', protect, async (req, res) => {
  try {
    const panel = await Panel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!panel) return res.status(404).json({ message: 'Panel not found' });

    // Auto-create alert if status changed to warning or offline
    if (req.body.status === 'warning' || req.body.status === 'offline') {
      await Alert.create({
        type: req.body.status === 'offline' ? 'critical' : 'warning',
        category: req.body.status === 'offline' ? 'offline' : 'efficiency',
        message: `Panel ${panel.name} status changed to ${req.body.status}`,
        panel: panel._id
      });
    }
    res.json(panel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE panel
router.delete('/:id', protect, async (req, res) => {
  try {
    const panel = await Panel.findByIdAndDelete(req.params.id);
    if (!panel) return res.status(404).json({ message: 'Panel not found' });
    res.json({ message: 'Panel deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET panel stats summary
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const total = await Panel.countDocuments();
    const online = await Panel.countDocuments({ status: 'online' });
    const warning = await Panel.countDocuments({ status: 'warning' });
    const offline = await Panel.countDocuments({ status: 'offline' });
    const totalCapacity = await Panel.aggregate([{ $group: { _id: null, total: { $sum: '$capacity' } } }]);
    const totalEnergy = await Panel.aggregate([{ $group: { _id: null, total: { $sum: '$totalEnergyGenerated' } } }]);

    res.json({
      total, online, warning, offline,
      totalCapacity: totalCapacity[0]?.total || 0,
      totalEnergyGenerated: totalEnergy[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
