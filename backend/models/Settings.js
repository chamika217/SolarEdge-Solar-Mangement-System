const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  systemName: { type: String, default: 'SolarEdge System' },
  autoStartSunrise: { type: Boolean, default: true },
  realTimeAlerts: { type: Boolean, default: true },
  autoReporting: { type: Boolean, default: false },
  gridExportMode: { type: Boolean, default: true },
  minEfficiencyThreshold: { type: Number, default: 60 },
  maxTemperatureThreshold: { type: Number, default: 75 },
  dataRefreshInterval: { type: Number, default: 30 }, // seconds
  inverterModel: { type: String, default: 'SMA Sunny Boy 10.0' },
  emailNotifications: { type: Boolean, default: false },
  notificationEmail: { type: String, default: '' },
  currency: { type: String, default: 'USD' },
  electricityRate: { type: Number, default: 0.20 } // per kWh
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
