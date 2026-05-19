const express = require('express')
const router = express.Router()
const BillingRate = require('../models/BillingRate')
const CustomerBill = require('../models/CustomerBill')
const EnergyReading = require('../models/EnergyReading')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// ─── BILLING RATES ───────────────────────────────

// GET all rates
router.get('/rates', protect, async (req, res) => {
  try {
    const rates = await BillingRate.find().sort({ createdAt: -1 })
    res.json(rates)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// POST create rate
router.post('/rates', protect, async (req, res) => {
  try {
    if (req.body.isDefault) await BillingRate.updateMany({}, { isDefault: false })
    const rate = await BillingRate.create(req.body)
    res.status(201).json(rate)
  } catch (err) { res.status(400).json({ message: err.message }) }
})

// PUT update rate
router.put('/rates/:id', protect, async (req, res) => {
  try {
    if (req.body.isDefault) await BillingRate.updateMany({}, { isDefault: false })
    const rate = await BillingRate.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(rate)
  } catch (err) { res.status(400).json({ message: err.message }) }
})

// DELETE rate
router.delete('/rates/:id', protect, async (req, res) => {
  try {
    await BillingRate.findByIdAndDelete(req.params.id)
    res.json({ message: 'Rate deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// ─── BILL CALCULATION ────────────────────────────

// POST calculate bill for a user/month
router.post('/calculate', protect, async (req, res) => {
  try {
    const { userId, month, year, rateId, gridUnits } = req.body

    // Get billing rate
    const rate = rateId
      ? await BillingRate.findById(rateId)
      : await BillingRate.findOne({ isDefault: true })

    if (!rate) return res.status(400).json({ message: 'No billing rate found. Please create one first.' })

    // Get solar energy for this month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const solarData = await EnergyReading.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalOutput: { $sum: '$output' } } }
    ])

    const solarKwh = Math.round((solarData[0]?.totalOutput || 0) / 1000 / 120 * 10) / 10
    const gridKwh = Number(gridUnits) || 0
    const totalConsumed = Math.round((solarKwh + gridKwh) * 10) / 10

    // Calculate costs
    const fullGridCost = Math.round(totalConsumed * rate.ratePerKwh * 100) / 100
    const solarSavings = Math.round(solarKwh * rate.ratePerKwh * 100) / 100
    const actualBill = Math.round(gridKwh * rate.ratePerKwh * 100) / 100
    const taxAmount = Math.round(actualBill * (rate.taxPercent / 100) * 100) / 100
    const totalDue = Math.round((actualBill + rate.fixedCharge + taxAmount) * 100) / 100

    // Save or update bill
    const bill = await CustomerBill.findOneAndUpdate(
      { customer: userId || req.user._id, month, year },
      {
        customer: userId || req.user._id,
        billingRate: rate._id,
        month, year,
        totalGridUnits: gridKwh,
        totalSolarUnits: solarKwh,
        totalConsumed,
        gridCost: fullGridCost,
        solarSavings,
        actualBill,
        fixedCharge: rate.fixedCharge,
        taxAmount,
        totalDue
      },
      { upsert: true, new: true }
    ).populate('billingRate').populate('customer', 'name email')

    res.json(bill)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// ─── BILLS ───────────────────────────────────────

// GET all bills (admin)
router.get('/bills', protect, async (req, res) => {
  try {
    const { month, year, status } = req.query
    const query = {}
    if (month) query.month = Number(month)
    if (year) query.year = Number(year)
    if (status) query.status = status

    const bills = await CustomerBill.find(query)
      .populate('customer', 'name email')
      .populate('billingRate', 'name ratePerKwh currency')
      .sort({ year: -1, month: -1 })
    res.json(bills)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET my bill (user)
router.get('/bills/my', protect, async (req, res) => {
  try {
    const bills = await CustomerBill.find({ customer: req.user._id })
      .populate('billingRate', 'name ratePerKwh currency')
      .sort({ year: -1, month: -1 })
    res.json(bills)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET single bill
router.get('/bills/:id', protect, async (req, res) => {
  try {
    const bill = await CustomerBill.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('billingRate')
    res.json(bill)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// PUT mark as paid
router.put('/bills/:id/pay', protect, async (req, res) => {
  try {
    const bill = await CustomerBill.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidAt: new Date() },
      { new: true }
    )
    res.json(bill)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// ─── SUMMARY ─────────────────────────────────────

// GET billing summary stats (admin)
router.get('/summary', protect, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query

    const bills = await CustomerBill.find({ year: Number(year) })
    const totalBilled = bills.reduce((s, b) => s + b.totalDue, 0)
    const totalSavings = bills.reduce((s, b) => s + b.solarSavings, 0)
    const totalSolar = bills.reduce((s, b) => s + b.totalSolarUnits, 0)
    const paid = bills.filter(b => b.status === 'paid').length
    const pending = bills.filter(b => b.status === 'pending').length
    const overdue = bills.filter(b => b.status === 'overdue').length

    const monthly = Array.from({ length: 12 }, (_, i) => {
      const monthBills = bills.filter(b => b.month === i + 1)
      return {
        month: i + 1,
        totalDue: Math.round(monthBills.reduce((s, b) => s + b.totalDue, 0) * 100) / 100,
        totalSavings: Math.round(monthBills.reduce((s, b) => s + b.solarSavings, 0) * 100) / 100,
        solarKwh: Math.round(monthBills.reduce((s, b) => s + b.totalSolarUnits, 0) * 10) / 10
      }
    })

    res.json({
      year: Number(year),
      totalBilled: Math.round(totalBilled * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100,
      totalSolarKwh: Math.round(totalSolar * 10) / 10,
      billCount: bills.length,
      paid, pending, overdue,
      monthly
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
