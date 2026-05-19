const mongoose = require('mongoose');

const energyReadingSchema = new mongoose.Schema({
  panel: { type: mongoose.Schema.Types.ObjectId, ref: 'Panel', required: true },
  output: { type: Number, required: true }, // Watts
  efficiency: { type: Number, default: 0 }, // %
  temperature: { type: Number, default: 0 }, // Celsius
  voltage: { type: Number, default: 0 },
  current: { type: Number, default: 0 },
  irradiance: { type: Number, default: 0 }, // W/m²
  timestamp: { type: Date, default: Date.now }
}, { timestamps: false });

energyReadingSchema.index({ panel: 1, timestamp: -1 });
energyReadingSchema.index({ timestamp: -1 });

module.exports = mongoose.model('EnergyReading', energyReadingSchema);
