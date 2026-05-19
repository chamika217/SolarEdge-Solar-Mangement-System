const mongoose = require('mongoose')

const customerBillSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  billingRate: { type: mongoose.Schema.Types.ObjectId, ref: 'BillingRate' },
  month: { type: Number, required: true },   // 1-12
  year: { type: Number, required: true },
  // Units
  totalGridUnits: { type: Number, default: 0 },     // kWh from grid
  totalSolarUnits: { type: Number, default: 0 },    // kWh from solar
  totalConsumed: { type: Number, default: 0 },      // total kWh used
  // Costs
  gridCost: { type: Number, default: 0 },           // what they would pay without solar
  solarSavings: { type: Number, default: 0 },       // money saved by solar
  actualBill: { type: Number, default: 0 },         // actual bill after solar
  fixedCharge: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalDue: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  paidAt: { type: Date, default: null },
  notes: { type: String, default: '' }
}, { timestamps: true })

module.exports = mongoose.model('CustomerBill', customerBillSchema)
