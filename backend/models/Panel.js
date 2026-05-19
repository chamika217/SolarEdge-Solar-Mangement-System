const mongoose = require('mongoose');

const panelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  arrayGroup: { type: String, required: true, default: 'Array A' },
  capacity: { type: Number, required: true, default: 400 }, // Watts
  status: { type: String, enum: ['online', 'warning', 'offline'], default: 'online' },
  installDate: { type: Date, default: Date.now },
  location: {
    latitude: { type: Number, default: 6.9271 },
    longitude: { type: Number, default: 79.8612 }
  },
  inverterModel: { type: String, default: 'SMA Sunny Boy 10.0' },
  currentOutput: { type: Number, default: 0 },
  currentEfficiency: { type: Number, default: 0 },
  currentTemperature: { type: Number, default: 0 },
  totalEnergyGenerated: { type: Number, default: 0 }, // kWh
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Panel', panelSchema);
