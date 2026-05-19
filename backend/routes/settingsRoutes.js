const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect } = require('../middleware/auth');

// GET settings
router.get('/', protect, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update settings
router.put('/', protect, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, req.body, { new: true, runValidators: true });
    }
    res.json(settings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
