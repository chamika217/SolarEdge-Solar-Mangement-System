import { useEffect, useState } from 'react'
import { Search, Zap, Thermometer, BarChart2, Sun } from 'lucide-react'
import api from '@/utils/api'
import { useSocket } from '@/context/SocketContext'

const STATUS_MAP = {
  online: { cls: 'badge-online', label: 'Online' },
  warning: { cls: 'badge-warning', label: 'Warning' },
  offline: { cls: 'badge-offline', label: 'Offline' }
}

export default function UserPanels() {
  const [panels, setPanels] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const { liveData } = useSocket()

  useEffect(() => {
    api.get('/panels').then(r => setPanels(r.data)).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!liveData) return
    setPanels(prev => prev.map(p => {
      const live = liveData.panels.find(lp => lp.panelId === p._id)
      return live ? { ...p, currentOutput: live.output, currentEfficiency: live.efficiency, currentTemperature: live.temperature } : p
    }))
  }, [liveData])

  useEffect(() => {
    let result = panels
    if (filter !== 'all') result = result.filter(p => p.status === filter)
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    setFiltered(result)
  }, [panels, filter, search])

  const counts = {
    all: panels.length,
    online: panels.filter(p => p.status === 'online').length,
    warning: panels.filter(p => p.status === 'warning').length,
    offline: panels.filter(p => p.status === 'offline').length
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Sun size={28} className="animate-spin text-solar-400" /></div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Solar Panels</h1>
        <p className="text-sm text-gray-500 mt-0.5">{panels.length} panels in your system</p>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 text-sm" placeholder="Search panels..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {['all','online','warning','offline'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-colors ${filter===s ? 'bg-solar-500 text-white border-solar-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {s} ({counts[s]})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(panel => {
          const eff = panel.currentEfficiency || 0
          const barColor = panel.status === 'online' ? 'bg-green-500' : panel.status === 'warning' ? 'bg-yellow-400' : 'bg-red-500'
          return (
            <div key={panel._id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{panel.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{panel.arrayGroup}</p>
                </div>
                <span className={STATUS_MAP[panel.status]?.cls}>{STATUS_MAP[panel.status]?.label}</span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Efficiency</span><span className="font-medium">{eff}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full`} style={{ width: `${eff}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Zap, label: 'Output', value: `${panel.currentOutput || 0}W`, color: 'text-yellow-600' },
                  { icon: BarChart2, label: 'Capacity', value: `${panel.capacity}W`, color: 'text-blue-600' },
                  { icon: Thermometer, label: 'Temp', value: `${panel.currentTemperature || 0}°C`, color: 'text-red-500' },
                  { icon: Sun, label: 'Array', value: panel.arrayGroup, color: 'text-gray-500' }
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                    <div className={`flex items-center gap-1 text-xs ${color} mb-1`}><Icon size={12} />{label}</div>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
