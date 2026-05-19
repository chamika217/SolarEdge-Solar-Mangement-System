const AuditLog = require('../models/AuditLog')

const auditLogger = (action, resource) => async (req, res, next) => {
  const originalJson = res.json.bind(res)
  res.json = async (data) => {
    try {
      if (req.user) {
        await AuditLog.create({
          user: req.user._id,
          userName: req.user.name,
          action,
          resource,
          resourceId: req.params?.id || data?._id || null,
          details: `${req.method} ${req.originalUrl}`,
          ip: req.ip || req.connection?.remoteAddress,
          status: res.statusCode < 400 ? 'success' : 'failed'
        })
      }
    } catch (e) { /* silent fail */ }
    return originalJson(data)
  }
  next()
}

module.exports = auditLogger
