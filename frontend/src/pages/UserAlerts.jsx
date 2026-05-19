import { useEffect, useState } from 'react'
import { Bell, AlertTriangle, AlertCircle, CheckCircle, Info, Sun } from 'lucide-react'
import api from '@/utils/api'
import { formatDistanceToNow } from 'date-fns'

const TYPE_CONFIG = {
  critical: { icon: AlertCircle, cls: 'bg-red-50 border-red-100', iconCls: 'text-red-500', badge: 'bg-red-100 text-red-700' },
  warning: { icon: AlertTriangle, cls: 'bg-yellow-50 border-yellow-100', iconCls: 'text-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
  info: { icon: Info, cls: 'bg-blue-50 border-blue-100', iconCls: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' },
  resolved: { icon: CheckCircle, cls: 'bg-green-50 border-green-100', iconCls: 'text-green-500', badge: 'bg-green-100 text-green-700' }
}

export default function UserAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/alerts?limit=50').then(r => setAlerts(r.data.alerts)).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.type === filter)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Alerts</h1>
        <p className="text-sm text-gray-500 mt-0.5">System notifications and warnings</p>
      </div>

      <div className="flex gap-1.5 mb-5">
        {['all','critical','warning','info','resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-colors ${filter===f ? 'bg-solar-500 text-white border-solar-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <div className="flex items-center justify-center h-48"><Sun size={28} className="animate-spin text-solar-400" /></div>
        : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Bell size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No alerts</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(alert => {
              const cfg = TYPE_CONFIG[alert.type] || TYPE_CONFIG.info
              const Icon = cfg.icon
              return (
                <div key={alert._id} className={`flex items-start gap-4 p-4 rounded-xl border ${cfg.cls}`}>
                  <Icon size={20} className={`${cfg.iconCls} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    {alert.panel && <p className="text-xs text-gray-500 mt-0.5">Panel: {alert.panel.name}</p>}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${cfg.badge}`}>{alert.type}</span>
                      <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
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
