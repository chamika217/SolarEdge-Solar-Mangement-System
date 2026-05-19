import { MetricCardSkeleton, ChartSkeleton } from '@/components/common/Skeleton'
import PDFExport from '@/components/common/PDFExport'
import { useEffect, useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import { BarChart2, TrendingUp, Zap, DollarSign, Sun } from 'lucide-react'
import api from '@/utils/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip, Legend)

const RANGES = [{ label: '7 Days', value: '7' }, { label: '30 Days', value: '30' }, { label: '90 Days', value: '90' }, { label: '1 Year', value: '365' }]

export default function Analytics() {
  const [range, setRange] = useState('7')
  const [daily, setDaily] = useState([])
  const [panelComp, setPanelComp] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [d, p] = await Promise.all([
          api.get(`/analytics/daily?days=${range}`),
          api.get(`/analytics/panels-comparison?days=${range}`)
        ])
        setDaily(d.data)
        setPanelComp(p.data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [range])

  const totalKwh = daily.reduce((s, d) => s + d.energyKwh, 0).toFixed(1)
  const avgEff = daily.length ? Math.round(daily.reduce((s, d) => s + (d.avgEfficiency || 0), 0) / daily.length) : 0
  const savings = (totalKwh * 0.20).toFixed(2)
  const co2 = (totalKwh * 0.43).toFixed(1)

  const barData = {
    labels: daily.map(d => d.date.slice(5)),
    datasets: [{ label: 'kWh', data: daily.map(d => d.energyKwh), backgroundColor: '#f59e0b', borderRadius: 5, hoverBackgroundColor: '#d97706' }]
  }
  const lineData = {
    labels: daily.map(d => d.date.slice(5)),
    datasets: [
      { label: 'Efficiency %', data: daily.map(d => d.avgEfficiency || 0), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 2 },
      { label: 'Temp °C', data: daily.map(d => d.avgTemperature || 0), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.05)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 2 }
    ]
  }
  const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { font: { size: 10 }, color: '#9ca3af' }, grid: { color: 'rgba(0,0,0,0.04)' } }, y: { ticks: { font: { size: 10 }, color: '#9ca3af' }, grid: { color: 'rgba(0,0,0,0.04)' }, beginAtZero: true } } }
  const lineOpts = { ...opts, plugins: { legend: { display: true, position: 'top', labels: { font: { size: 10 }, boxWidth: 10, padding: 8 } } } }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Energy production insights</p>
        </div>
        <div className="flex gap-1.5">
          {RANGES.map(r => (
            <button key={r.value} onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${range === r.value ? 'bg-solar-500 text-white border-solar-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: Zap, label: 'Total Generated', value: `${totalKwh} kWh`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { icon: DollarSign, label: 'Cost Savings', value: `$${savings}`, color: 'text-green-600', bg: 'bg-green-50' },
          { icon: TrendingUp, label: 'Avg Efficiency', value: `${avgEff}%`, color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: Sun, label: 'CO₂ Avoided', value: `${co2} kg`, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="card p-4">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}><Icon size={17} className={color} /></div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-lg font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <p className="font-semibold text-sm text-gray-800 mb-1">Daily Energy Production</p>
          <p className="text-xs text-gray-400 mb-4">kWh per day</p>
          {loading ? <div className="h-48 flex items-center justify-center text-gray-400"><Sun size={24} className="animate-spin" /></div>
            : <div style={{ height: 200 }}><Bar data={barData} options={opts} /></div>}
        </div>
        <div className="card p-5">
          <p className="font-semibold text-sm text-gray-800 mb-1">Efficiency & Temperature</p>
          <p className="text-xs text-gray-400 mb-4">Daily averages</p>
          {loading ? <div className="h-48 flex items-center justify-center text-gray-400"><Sun size={24} className="animate-spin" /></div>
            : <div style={{ height: 200 }}><Line data={lineData} options={lineOpts} /></div>}
        </div>
      </div>

      {/* Panel comparison table */}
      <div className="card p-5">
        <p className="font-semibold text-sm text-gray-800 mb-4">Panel Performance Comparison</p>
        {loading ? <div className="text-center py-8 text-gray-400"><Sun size={24} className="animate-spin mx-auto" /></div>
          : panelComp.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No reading data yet. Run the seeder to populate data.</p>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left pb-3 font-medium">Panel</th>
                    <th className="text-left pb-3 font-medium">Array</th>
                    <th className="text-right pb-3 font-medium">Energy (kWh)</th>
                    <th className="text-right pb-3 font-medium">Avg Efficiency</th>
                    <th className="text-right pb-3 font-medium">Avg Temp</th>
                    <th className="pb-3 font-medium pl-4">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {panelComp.map((p, i) => {
                    const maxKwh = panelComp[0]?.energyKwh || 1
                    const pct = Math.round((p.energyKwh / maxKwh) * 100)
                    return (
                      <tr key={p.panelId} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-800">{p.panelName}</td>
                        <td className="py-3 text-gray-500">{p.arrayGroup}</td>
                        <td className="py-3 text-right font-semibold">{p.energyKwh}</td>
                        <td className="py-3 text-right">{p.avgEfficiency}%</td>
                        <td className="py-3 text-right">{p.avgTemperature}°C</td>
                        <td className="py-3 pl-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-solar-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  )
}
