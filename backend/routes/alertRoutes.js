const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { protect } = require('../middleware/auth');

// GET all alerts
router.get('/', protect, async (req, res) => {
  try {
    const { unread, type, limit = 50 } = req.query;
    const query = {};
    if (unread === 'true') query.isRead = false;
    if (type) query.type = type;
    const alerts = await Alert.find(query).populate('panel', 'name arrayGroup').sort({ createdAt: -1 }).limit(Number(limit));
    const unreadCount = await Alert.countDocuments({ isRead: false });
    res.json({ alerts, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT mark alert as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT mark all as read
router.put('/mark-all/read', protect, async (req, res) => {
  try {
    await Alert.updateMany({ isRead: false }, { isRead: true });
    res.json({ message: 'All alerts marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT resolve alert
router.put('/:id/resolve', protect, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id,
      { isResolved: true, resolvedAt: new Date(), isRead: true },
      { new: true }
    );
    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE alert
router.delete('/:id', protect, async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
