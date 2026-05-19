const express = require('express')
const router = express.Router()
const AuditLog = require('../models/AuditLog')
const { protect } = require('../middleware/auth')

// GET audit logs
router.get('/', protect, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query
    const skip = (page - 1) * limit
    const [logs, total] = await Promise.all([
      AuditLog.find().populate('user','name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      AuditLog.countDocuments()
    ])
    res.json({ logs, total, pages: Math.ceil(total / limit) })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// POST create log (internal use)
router.post('/', protect, async (req, res) => {
  try {
    const log = await AuditLog.create({
      ...req.body,
      user: req.user._id,
      userName: req.user.name,
      ip: req.ip
    })
    res.status(201).json(log)
  } catch (err) { res.status(400).json({ message: err.message }) }
})

module.exports = router
