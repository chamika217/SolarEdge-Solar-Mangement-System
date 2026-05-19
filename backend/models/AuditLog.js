const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  userName: { type: String, default: 'System' },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: String, default: null },
  details: { type: String, default: '' },
  ip: { type: String, default: '' },
  status: { type: String, enum: ['success', 'failed'], default: 'success' }
}, { timestamps: true })

auditLogSchema.index({ createdAt: -1 })

module.exports = mongoose.model('AuditLog', auditLogSchema)
