import { useState } from 'react'
import { FileText, Download, Loader } from 'lucide-react'
import api from '@/utils/api'

export default function PDFExport({ days = 30 }) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/export/report?days=${days}`)

      // Build HTML report
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Solar Report - ${new Date().toLocaleDateString()}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #1f2937; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; border-bottom: 2px solid #f59e0b; padding-bottom: 16px; }
    .logo { width: 48px; height: 48px; background: #f59e0b; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    h1 { font-size: 24px; font-weight: 700; margin: 0; }
    h2 { font-size: 16px; font-weight: 600; margin: 24px 0 12px; color: #374151; border-left: 3px solid #f59e0b; padding-left: 10px; }
    .grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
    .metric { background: #f9fafb; border-radius: 8px; padding: 16px; text-align: center; }
    .metric-val { font-size: 24px; font-weight: 700; color: #f59e0b; }
    .metric-label { font-size: 11px; color: #6b7280; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f3f4f6; padding: 10px 12px; text-align: left; font-weight: 600; color: #374151; }
    td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
    .online { background: #d1fae5; color: #065f46; }
    .warning { background: #fef3c7; color: #92400e; }
    .offline { background: #fee2e2; color: #991b1b; }
    .critical { background: #fee2e2; color: #991b1b; }
    .info { background: #dbeafe; color: #1e40af; }
    .resolved { background: #d1fae5; color: #065f46; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">☀️</div>
    <div>
      <h1>SolarEdge Management Report</h1>
      <p style="margin:0;color:#6b7280;font-size:13px;">Period: Last ${data.period.days} days · Generated: ${new Date(data.generatedAt).toLocaleString()}</p>
    </div>
  </div>

  <h2>Summary</h2>
  <div class="grid">
    <div class="metric"><div class="metric-val">${data.summary.totalKwh}</div><div class="metric-label">Total kWh Generated</div></div>
    <div class="metric"><div class="metric-val">$${data.summary.savings}</div><div class="metric-label">Cost Savings</div></div>
    <div class="metric"><div class="metric-val">${data.summary.avgEfficiency}%</div><div class="metric-label">Avg Efficiency</div></div>
    <div class="metric"><div class="metric-val">${data.summary.co2Avoided} kg</div><div class="metric-label">CO₂ Avoided</div></div>
  </div>

  <h2>Panel Status (${data.summary.totalPanels} panels)</h2>
  <table>
    <thead><tr><th>Panel</th><th>Array</th><th>Status</th><th>Capacity</th><th>Output</th><th>Efficiency</th></tr></thead>
    <tbody>
      ${data.panels.map(p => `
        <tr>
          <td>${p.name}</td><td>${p.arrayGroup}</td>
          <td><span class="badge ${p.status}">${p.status}</span></td>
          <td>${p.capacity}W</td><td>${p.currentOutput}W</td><td>${p.currentEfficiency}%</td>
        </tr>`).join('')}
    </tbody>
  </table>

  <h2>Daily Production</h2>
  <table>
    <thead><tr><th>Date</th><th>Energy (kWh)</th><th>Avg Efficiency</th></tr></thead>
    <tbody>
      ${data.daily.map(d => `<tr><td>${d.date}</td><td>${d.energyKwh}</td><td>${d.avgEfficiency}%</td></tr>`).join('')}
    </tbody>
  </table>

  <h2>Recent Alerts</h2>
  <table>
    <thead><tr><th>Type</th><th>Message</th><th>Panel</th><th>Date</th></tr></thead>
    <tbody>
      ${data.recentAlerts.map(a => `
        <tr>
          <td><span class="badge ${a.type}">${a.type}</span></td>
          <td>${a.message}</td><td>${a.panel}</td>
          <td>${new Date(a.date).toLocaleDateString()}</td>
        </tr>`).join('')}
    </tbody>
  </table>

  <div class="footer">SolarEdge Management System · Report generated automatically</div>
</body>
</html>`

      // Open print dialog
      const win = window.open('', '_blank')
      win.document.write(html)
      win.document.close()
      win.focus()
      setTimeout(() => win.print(), 500)

    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <button onClick={handleExport} disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">
      {loading ? <Loader size={14} className="animate-spin" /> : <FileText size={14} />}
      Export PDF
    </button>
  )
}
