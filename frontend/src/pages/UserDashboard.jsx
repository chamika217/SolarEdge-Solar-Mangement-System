import { useEffect, useState } from 'react'
import { Line, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend } from 'chart.js'
import { Zap, Battery, Sun, Leaf, TrendingUp, AlertTriangle, Thermometer, CheckCircle, Clock, DollarSign } from 'lucide-react'
import api from '@/utils/api'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/context/SocketContext'
import { MetricCardSkeleton } from '@/components/common/Skeleton'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend)

const ResourceBar = ({ label, value, max, unit, color }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-500 font-medium">{label}</span>
        <span className="font-semibold text-gray-700 dark:text-gray-200">{value}{unit} <span className="text-gray-400 font-normal">/ {max}{unit}</span></span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span className="text-gray-400">{pct}% in use</span>
        <span className="text-gray-400">{max - value > 0 ? `${Math.round((max-value)*10)/10}${unit} available` : 'At capacity'}</span>
      </div>
    </div>
  )
}

const StatChip = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
      <Icon size={16} />
    </div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  </div>
)

export default function UserDashboard() {
  const [resources, setResources] = useState(null)
  const [hourly, setHourly] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { liveData, connected } = useSocket()
  const [liveOutput, setLiveOutput] = useState(0)

  const fetchData = async () => {
    try {
      const [resRes, hrRes] = await Promise.all([
        api.get('/resources/overview'),
        api.get('/readings/today/hourly')
      ])
      setResources(resRes.data)
      setHourly(hrRes.data)
      setLiveOutput(resRes.data.power.currentOutputKw)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchData()
    const iv = setInterval(fetchData, 30000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (liveData) setLiveOutput(Math.round(liveData.totalOutput / 100) / 10)
  }, [liveData])

  const chartData = {
    labels: hourly.filter(h => h.hour >= 6 && h.hour <= 18).map(h => `${h.hour}:00`),
    datasets: [{
      label: 'Output (W)',
      data: hourly.filter(h => h.hour >= 6 && h.hour <= 18).map(h => h.output),
      borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)',
      fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2
    }]
  }

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { font: { size: 10 }, color: '#9ca3af' }, grid: { color: 'rgba(0,0,0,0.04)' } },
      y: { ticks: { font: { size: 10 }, color: '#9ca3af' }, grid: { color: 'rgba(0,0,0,0.04)' }, beginAtZero: true }
    }
  }

  const healthData = {
    datasets: [{
      data: [resources?.panels.online||0, resources?.panels.warning||0, resources?.panels.offline||0],
      backgroundColor: ['#10b981','#f59e0b','#ef4444'], borderWidth: 0
    }]
  }

  const r = resources

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Here's your solar system live overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full ${connected ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 pulse-dot' : 'bg-gray-400'}`} />
            {connected ? 'Live' : 'Offline'}
          </div>
          {r && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-full">
              <Clock size={11} />
              Updated {new Date(r.lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Top metrics */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4 mb-6">{[1,2,3,4].map(i=><MetricCardSkeleton key={i}/>)}</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Zap, label: 'Live Output', value: liveOutput, unit: 'kW', sub: `${r?.power.usagePercent||0}% of capacity`, color: '#d97706' },
            { icon: Battery, label: "Today's Energy", value: r?.energy.todayKwh||0, unit: 'kWh', sub: `Saved $${r?.energy.todaySavings||0}`, color: '#059669' },
            { icon: Sun, label: 'Active Panels', value: `${r?.panels.online||0}/${r?.panels.total||0}`, sub: `${r?.panels.warning||0} warning, ${r?.panels.offline||0} offline`, color: '#3b82f6' },
            { icon: Leaf, label: 'CO₂ Avoided', value: r?.energy.co2Today||0, unit: 'kg', sub: `${r?.energy.co2Month||0} kg this month`, color: '#7c3aed' }
          ].map(({ icon: Icon, label, value, unit, sub, color }) => (
            <div key={label} className="card p-5">
              <div className="flex items-center gap-2 text-sm font-medium mb-3" style={{ color }}>
                <Icon size={16} />{label}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {value} <span className="text-base font-normal text-gray-400">{unit}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">{sub}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Resource Usage Card */}
        <div className="card p-5 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">Available Resources</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(r?.power.usagePercent||0) > 80 ? 'bg-red-100 text-red-600' : (r?.power.usagePercent||0) > 50 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
              {r?.power.usagePercent||0}% used
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-10 bg-gray-100 rounded animate-pulse"/>)}</div>
          ) : (
            <>
              <ResourceBar
                label="Power Output"
                value={liveOutput}
                max={r?.power.totalCapacityKw||0}
                unit=" kW"
                color="bg-solar-400"
              />
              <ResourceBar
                label="Today's Energy"
                value={r?.energy.todayKwh||0}
                max={Math.round(r?.power.totalCapacityKw * 8 * 10) / 10 || 1}
                unit=" kWh"
                color="bg-blue-400"
              />
              <ResourceBar
                label="Active Panels"
                value={r?.panels.online||0}
                max={r?.panels.total||1}
                unit=""
                color="bg-green-400"
              />

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <StatChip icon={Thermometer} label="Avg Temp" value={`${r?.performance.avgTemperature||0}°C`} color="bg-red-50 text-red-500" />
                <StatChip icon={TrendingUp} label="Efficiency" value={`${r?.performance.avgEfficiency||0}%`} color="bg-green-50 text-green-600" />
                <StatChip icon={DollarSign} label="Month Saved" value={`$${r?.energy.monthSavings||0}`} color="bg-solar-50 text-solar-600" />
                <StatChip icon={AlertTriangle} label="Alerts" value={r?.alerts.unread||0} color={r?.alerts.unread > 0 ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-500"} />
              </div>

              {/* Panel health summary */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 mb-3">Panel Health</p>
                <div className="space-y-2">
                  {[
                    { label: 'Online', count: r?.panels.online||0, color: 'bg-green-500', textColor: 'text-green-600' },
                    { label: 'Warning', count: r?.panels.warning||0, color: 'bg-yellow-400', textColor: 'text-yellow-600' },
                    { label: 'Offline', count: r?.panels.offline||0, color: 'bg-red-500', textColor: 'text-red-600' },
                  ].map(({ label, count, color, textColor }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${color}`} />
                        <span className="text-xs text-gray-500">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${r?.panels.total ? (count/r.panels.total)*100 : 0}%` }} />
                        </div>
                        <span className={`text-xs font-semibold ${textColor} w-4 text-right`}>{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Production Chart */}
        <div className="card p-5 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">Energy Production — Today</p>
              <p className="text-xs text-gray-400 mt-0.5">Hourly output in Watts</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Available capacity</p>
              <p className="text-sm font-bold text-green-600">{r?.power.availableKw||0} kW free</p>
            </div>
          </div>
          <div style={{ height: 220 }}><Line data={chartData} options={chartOpts} /></div>
          
          {/* Bottom stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            {[
              { label: 'Month Energy', value: `${r?.energy.monthKwh||0} kWh`, icon: Battery, color: 'text-blue-500' },
              { label: 'Month Savings', value: `$${r?.energy.monthSavings||0}`, icon: DollarSign, color: 'text-green-500' },
              { label: 'CO₂ This Month', value: `${r?.energy.co2Month||0} kg`, icon: Leaf, color: 'text-purple-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="text-center">
                <Icon size={16} className={`${color} mx-auto mb-1`} />
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System status banner */}
      {!loading && r && (
        <div className={`card p-4 border-l-4 ${r.panels.offline > 0 ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : r.panels.warning > 0 ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10' : 'border-green-400 bg-green-50 dark:bg-green-900/10'}`}>
          <div className="flex items-center gap-3">
            {r.panels.offline > 0
              ? <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
              : r.panels.warning > 0
              ? <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0" />
              : <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
            }
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {r.panels.offline > 0
                  ? `${r.panels.offline} panel${r.panels.offline>1?'s':''} offline — maintenance required`
                  : r.panels.warning > 0
                  ? `${r.panels.warning} panel${r.panels.warning>1?'s':''} showing warnings`
                  : 'All systems operating normally'
                }
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                System efficiency: {r.performance.avgEfficiency}% · {r.panels.online}/{r.panels.total} panels active · {r.alerts.unread} unread alerts
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
