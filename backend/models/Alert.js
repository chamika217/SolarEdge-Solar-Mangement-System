const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: { type: String, enum: ['critical', 'warning', 'info', 'resolved'], required: true },
  category: { type: String, enum: ['offline', 'efficiency', 'temperature', 'voltage', 'maintenance', 'system'], required: true },
  message: { type: String, required: true },
  panel: { type: mongoose.Schema.Types.ObjectId, ref: 'Panel', default: null },
  isRead: { type: Boolean, default: false },
  isResolved: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null },
  value: { type: Number, default: null },
  threshold: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
