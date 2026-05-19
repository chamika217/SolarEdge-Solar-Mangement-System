import { useEffect, useState } from 'react'
import { Bell, AlertTriangle, AlertCircle, CheckCircle, Info, Trash2, Check, CheckCheck, Sun } from 'lucide-react'
import api from '@/utils/api'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const TYPE_CONFIG = {
  critical: { icon: AlertCircle, cls: 'bg-red-50 border-red-100', iconCls: 'text-red-500', badge: 'bg-red-100 text-red-700' },
  warning: { icon: AlertTriangle, cls: 'bg-yellow-50 border-yellow-100', iconCls: 'text-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
  info: { icon: Info, cls: 'bg-blue-50 border-blue-100', iconCls: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' },
  resolved: { icon: CheckCircle, cls: 'bg-green-50 border-green-100', iconCls: 'text-green-500', badge: 'bg-green-100 text-green-700' }
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get('/alerts?limit=100')
      setAlerts(data.alerts)
      setUnreadCount(data.unreadCount)
    } catch { toast.error('Failed to load alerts') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAlerts() }, [])

  const markRead = async (id) => {
    try {
      await api.put(`/alerts/${id}/read`)
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch { toast.error('Failed to update') }
  }

  const markAllRead = async () => {
    try {
      await api.put('/alerts/mark-all/read')
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })))
      setUnreadCount(0)
      toast.success('All marked as read')
    } catch { toast.error('Failed to update') }
  }

  const resolve = async (id) => {
    try {
      const { data } = await api.put(`/alerts/${id}/resolve`)
      setAlerts(prev => prev.map(a => a._id === id ? data : a))
      toast.success('Alert resolved')
    } catch { toast.error('Failed to resolve') }
  }

  const deleteAlert = async (id) => {
    try {
      await api.delete(`/alerts/${id}`)
      setAlerts(prev => prev.filter(a => a._id !== id))
      toast.success('Alert deleted')
    } catch { toast.error('Failed to delete') }
  }

  const filtered = filter === 'all' ? alerts : filter === 'unread' ? alerts.filter(a => !a.isRead) : alerts.filter(a => a.type === filter)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread alerts</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck size={15} />Mark all read
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { type: 'critical', label: 'Critical', count: alerts.filter(a=>a.type==='critical').length },
          { type: 'warning', label: 'Warnings', count: alerts.filter(a=>a.type==='warning').length },
          { type: 'info', label: 'Info', count: alerts.filter(a=>a.type==='info').length },
          { type: 'resolved', label: 'Resolved', count: alerts.filter(a=>a.type==='resolved'||a.isResolved).length }
        ].map(({ type, label, count }) => {
          const cfg = TYPE_CONFIG[type]
          const Icon = cfg.icon
          return (
            <button key={type} onClick={() => setFilter(filter === type ? 'all' : type)}
              className={`card p-4 text-left transition-all hover:shadow-md ${filter === type ? 'ring-2 ring-solar-400' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className={cfg.iconCls} />
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.badge}`}>{count}</span>
              </div>
              <p className="text-sm font-medium text-gray-700">{label}</p>
            </button>
          )
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4">
        {['all', 'unread', 'critical', 'warning', 'info', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors border ${filter === f ? 'bg-solar-500 text-white border-solar-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><Sun size={28} className="animate-spin text-solar-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No alerts found</p>
          <p className="text-gray-400 text-sm mt-1">Your system is running smoothly</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(alert => {
            const cfg = TYPE_CONFIG[alert.type] || TYPE_CONFIG.info
            const Icon = cfg.icon
            return (
              <div key={alert._id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${cfg.cls} ${!alert.isRead ? 'shadow-sm' : 'opacity-75'}`}>
                <Icon size={20} className={`${cfg.iconCls} mt-0.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      {alert.panel && <p className="text-xs text-gray-500 mt-0.5">Panel: {alert.panel.name}</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${cfg.badge}`}>{alert.type}</span>
                        <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
                        {!alert.isRead && <span className="w-2 h-2 bg-solar-500 rounded-full" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!alert.isRead && (
                        <button onClick={() => markRead(alert._id)} title="Mark read" className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Check size={14} /></button>
                      )}
                      {!alert.isResolved && alert.type !== 'resolved' && (
                        <button onClick={() => resolve(alert._id)} title="Resolve" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><CheckCircle size={14} /></button>
                      )}
                      <button onClick={() => deleteAlert(alert._id)} title="Delete" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
