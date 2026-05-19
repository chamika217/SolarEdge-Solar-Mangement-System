import { useEffect, useState } from 'react'
import { Line, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend } from 'chart.js'
import { Zap, Battery, Sun, Leaf, AlertTriangle, TrendingUp } from 'lucide-react'
import api from '@/utils/api'
import { useSocket } from '@/context/SocketContext'
import { MetricCardSkeleton, ChartSkeleton } from '@/components/common/Skeleton'
import PDFExport from '@/components/common/PDFExport'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend)

export default function Dashboard() {
  const [overview, setOverview] = useState(null)
  const [hourly, setHourly] = useState([])
  const [loading, setLoading] = useState(true)
  const { liveData, connected } = useSocket()
  const [currentOutput, setCurrentOutput] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ovRes, hrRes] = await Promise.all([api.get('/analytics/overview'), api.get('/readings/today/hourly')])
        setOverview(ovRes.data)
        setHourly(hrRes.data)
        setCurrentOutput(ovRes.data.currentOutputKw)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchData()
    const iv = setInterval(fetchData, 60000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (liveData) setCurrentOutput(Math.round(liveData.totalOutput / 100) / 10)
  }, [liveData])

  const chartData = {
    labels: hourly.filter(h => h.hour >= 6 && h.hour <= 18).map(h => `${h.hour}:00`),
    datasets: [{
      label: 'Output (W)', data: hourly.filter(h => h.hour >= 6 && h.hour <= 18).map(h => h.output),
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
    datasets: [{ data: [overview?.online||0, overview?.warning||0, overview?.offline||0],
      backgroundColor: ['#10b981','#f59e0b','#ef4444'], borderWidth: 0 }]
  }

  const savings = ((overview?.monthEnergyKwh || 0) * 0.20).toFixed(2)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time solar system overview</p>
        </div>
        <div className="flex items-center gap-3">
          <PDFExport days={30} />
          <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full ${connected ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 pulse-dot' : 'bg-gray-400'}`} />
            {connected ? 'Live' : 'Offline'}
          </div>
        </div>
      </div>

      {/* Metrics */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4 mb-6">{[1,2,3,4].map(i => <MetricCardSkeleton key={i} />)}</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Zap, label: 'Current Output', value: currentOutput, unit: 'kW', sub: 'Live from panels', color: '#d97706' },
            { icon: Battery, label: "Today's Energy", value: overview?.todayEnergyKwh||0, unit: 'kWh', sub: 'Generated today', color: '#059669' },
            { icon: Sun, label: 'Active Panels', value: `${overview?.online||0}/${overview?.totalPanels||0}`, sub: `${overview?.warning||0} warnings`, color: '#3b82f6' },
            { icon: Leaf, label: 'CO₂ Avoided', value: overview?.co2Avoided||0, unit: 'kg', sub: 'Environmental impact', color: '#7c3aed' }
          ].map(({ icon: Icon, label, value, unit, sub, color }) => (
            <div key={label} className="card p-5">
              <div className="flex items-center gap-2 text-sm font-medium mb-3" style={{ color }}>
                <Icon size={16} />{label}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {value} <span className="text-base font-normal text-gray-400">{unit}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <TrendingUp size={11} className="text-green-500" />{sub}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="col-span-2"><ChartSkeleton height={200} /></div>
          <ChartSkeleton height={200} />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="card p-5 col-span-2">
            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-1">Energy Production — Today</p>
            <p className="text-xs text-gray-400 mb-4">Hourly output in Watts</p>
            <div style={{ height: 200 }}><Line data={chartData} options={chartOpts} /></div>
          </div>
          <div className="card p-5">
            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-1">System Health</p>
            <p className="text-xs text-gray-400 mb-4">Panel status overview</p>
            <div className="flex justify-center mb-4" style={{ height: 110 }}>
              <Doughnut data={healthData} options={{ cutout:'70%', plugins:{legend:{display:false}}, maintainAspectRatio:false }} />
            </div>
            <div className="space-y-2">
              {[['Online',overview?.online||0,'bg-green-500'],['Warning',overview?.warning||0,'bg-yellow-400'],['Offline',overview?.offline||0,'bg-red-500']].map(([label,count,cls]) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 dark:text-gray-300"><span className={`w-2 h-2 rounded-sm ${cls}`}/>{label}</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card p-4 bg-gradient-to-r from-solar-50 to-green-50 dark:from-solar-900/20 dark:to-green-900/20 border-solar-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-solar-500 rounded-lg flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Monthly Savings: <span className="text-green-600">${savings}</span></p>
            <p className="text-xs text-gray-500">{overview?.monthEnergyKwh||0} kWh generated this month</p>
          </div>
          {(overview?.warning > 0 || overview?.offline > 0) && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-lg">
              <AlertTriangle size={13} />{(overview.warning||0) + (overview.offline||0)} panels need attention
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
