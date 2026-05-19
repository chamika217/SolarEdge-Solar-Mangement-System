const mongoose = require('mongoose')

const billingRateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ratePerKwh: { type: Number, required: true },      // Grid rate per kWh
  solarRatePerKwh: { type: Number, default: 0 },     // Solar export rate
  fixedCharge: { type: Number, default: 0 },         // Fixed monthly charge
  taxPercent: { type: Number, default: 0 },          // Tax %
  currency: { type: String, default: 'USD' },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('BillingRate', billingRateSchema)
