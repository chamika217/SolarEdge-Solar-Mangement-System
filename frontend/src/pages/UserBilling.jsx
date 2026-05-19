import { useEffect, useState } from 'react'
import { DollarSign, FileText, CheckCircle, Clock, AlertTriangle, TrendingDown, Zap, Leaf, Sun } from 'lucide-react'
import api from '@/utils/api'
import { useAuth } from '@/context/AuthContext'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const STATUS_MAP = {
  paid: { cls: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Paid' },
  pending: { cls: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
  overdue: { cls: 'bg-red-100 text-red-700', icon: AlertTriangle, label: 'Overdue' }
}

export default function UserBilling() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/billing/bills/my')
      .then(r => setBills(r.data))
      .finally(() => setLoading(false))
  }, [])

  const totalSavings = bills.reduce((s, b) => s + b.solarSavings, 0).toFixed(2)
  const totalPaid = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.totalDue, 0).toFixed(2)
  const totalSolar = bills.reduce((s, b) => s + b.totalSolarUnits, 0).toFixed(1)

  const printInvoice = (bill) => {
    const win = window.open('', '_blank')
    win.document.write(`
<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<title>Invoice - ${MONTHS[bill.month-1]} ${bill.year}</title>
<style>
  body{font-family:Arial,sans-serif;margin:40px;color:#1f2937}
  .header{display:flex;justify-content:space-between;align-items:start;margin-bottom:32px;padding-bottom:16px;border-bottom:2px solid #f59e0b}
  .logo{display:flex;align-items:center;gap:10px}
  .logo-icon{width:40px;height:40px;background:#f59e0b;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:20px}
  h1{font-size:20px;font-weight:700;margin:0}
  .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:${bill.status==='paid'?'#d1fae5':'#fef3c7'};color:${bill.status==='paid'?'#065f46':'#92400e'}}
  table{width:100%;border-collapse:collapse;margin:16px 0}
  th{background:#f9fafb;padding:10px 14px;text-align:left;font-size:12px;color:#6b7280;font-weight:600}
  td{padding:10px 14px;border-bottom:1px solid #f3f4f6;font-size:13px}
  .total-row td{font-weight:700;font-size:15px;background:#fffbeb}
  .footer{margin-top:40px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:16px}
</style></head><body>
<div class="header">
  <div class="logo">
    <div class="logo-icon">☀️</div>
    <div><h1>SolarEdge</h1><p style="margin:0;font-size:12px;color:#6b7280">Solar Management System</p></div>
  </div>
  <div style="text-align:right">
    <p style="font-size:20px;font-weight:700;margin:0">INVOICE</p>
    <p style="font-size:12px;color:#6b7280;margin:4px 0">${MONTHS[bill.month-1]} ${bill.year}</p>
    <span class="badge">${bill.status?.toUpperCase()}</span>
  </div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px">
  <div><p style="font-size:11px;color:#6b7280;margin-bottom:4px">BILL TO</p>
    <p style="font-weight:600;margin:0">${bill.customer?.name || user?.name}</p>
    <p style="color:#6b7280;font-size:13px;margin:2px 0">${bill.customer?.email || user?.email}</p>
  </div>
  <div><p style="font-size:11px;color:#6b7280;margin-bottom:4px">BILLING PERIOD</p>
    <p style="font-weight:600;margin:0">${MONTHS[bill.month-1]} ${bill.year}</p>
    <p style="color:#6b7280;font-size:13px;margin:2px 0">Rate: ${bill.billingRate?.name || 'Standard'}</p>
  </div>
</div>
<table>
  <thead><tr><th>Description</th><th>Units (kWh)</th><th>Rate</th><th>Amount</th></tr></thead>
  <tbody>
    <tr><td>Grid Electricity Consumed</td><td>${bill.totalGridUnits}</td><td>$${bill.billingRate?.ratePerKwh || 0}/kWh</td><td>$${bill.actualBill}</td></tr>
    <tr><td>Fixed Monthly Charge</td><td>-</td><td>-</td><td>$${bill.fixedCharge}</td></tr>
    <tr><td>Tax</td><td>-</td><td>-</td><td>$${bill.taxAmount}</td></tr>
    <tr class="total-row"><td colspan="3">TOTAL DUE</td><td>$${bill.totalDue}</td></tr>
  </tbody>
</table>
<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-top:16px">
  <p style="font-size:13px;font-weight:600;color:#065f46;margin:0 0 8px">☀️ Your Solar Savings</p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
    <div><p style="font-size:11px;color:#6b7280;margin:0">Solar Generated</p><p style="font-weight:700;color:#059669;margin:4px 0">${bill.totalSolarUnits} kWh</p></div>
    <div><p style="font-size:11px;color:#6b7280;margin:0">Without Solar</p><p style="font-weight:700;margin:4px 0">$${bill.gridCost}</p></div>
    <div><p style="font-size:11px;color:#6b7280;margin:0">You Saved</p><p style="font-weight:700;color:#059669;font-size:18px;margin:4px 0">$${bill.solarSavings}</p></div>
  </div>
</div>
<div class="footer">SolarEdge Management System · Generated ${new Date().toLocaleString()}</div>
</body></html>`)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Bills</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your electricity billing history & solar savings</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-5 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800">
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-3">
            <TrendingDown size={16} />Total Savings
          </div>
          <p className="text-3xl font-bold text-green-600">${totalSavings}</p>
          <p className="text-xs text-gray-400 mt-1">Saved by using solar energy</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-solar-600 text-sm font-medium mb-3">
            <Zap size={16} />Solar Generated
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalSolar} <span className="text-base font-normal text-gray-400">kWh</span></p>
          <p className="text-xs text-gray-400 mt-1">Total solar energy used</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-3">
            <DollarSign size={16} />Total Paid
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalPaid}</p>
          <p className="text-xs text-gray-400 mt-1">{bills.filter(b=>b.status==='paid').length} bills paid</p>
        </div>
      </div>

      {/* Bills list */}
      {loading ? (
        <div className="card p-8 text-center">
          <Sun size={28} className="animate-spin text-solar-400 mx-auto" />
        </div>
      ) : bills.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No bills yet</p>
          <p className="text-gray-400 text-sm mt-1">Your bills will appear here once admin generates them</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map(bill => {
            const st = STATUS_MAP[bill.status] || STATUS_MAP.pending
            const Icon = st.icon
            const isSelected = selected === bill._id
            return (
              <div key={bill._id} className="card overflow-hidden">
                {/* Bill header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => setSelected(isSelected ? null : bill._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-solar-50 dark:bg-solar-900/30 rounded-xl flex flex-col items-center justify-center">
                      <p className="text-xs font-bold text-solar-600">{MONTHS[bill.month-1]}</p>
                      <p className="text-xs text-solar-500">{bill.year}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{MONTHS[bill.month-1]} {bill.year} Bill</p>
                      <p className="text-xs text-gray-400 mt-0.5">{bill.billingRate?.name || 'Standard Rate'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">${bill.totalDue}</p>
                      <p className="text-xs text-green-600 font-medium">Saved ${bill.solarSavings}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${st.cls}`}>
                      <Icon size={11} />{st.label}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); printInvoice(bill) }}
                      className="flex items-center gap-1.5 text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
                    >
                      <FileText size={12} />Invoice
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isSelected && (
                  <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/30">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Cost breakdown */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cost Breakdown</p>
                        <div className="space-y-2">
                          {[
                            { label: 'Grid Units Used', value: `${bill.totalGridUnits} kWh` },
                            { label: 'Electricity Charge', value: `$${bill.actualBill}` },
                            { label: 'Fixed Charge', value: `$${bill.fixedCharge}` },
                            { label: 'Tax', value: `$${bill.taxAmount}` },
                          ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between text-xs">
                              <span className="text-gray-500">{label}</span>
                              <span className="font-medium text-gray-700 dark:text-gray-300">{value}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span className="text-gray-800 dark:text-gray-100">Total Due</span>
                            <span className="text-gray-900 dark:text-white">${bill.totalDue}</span>
                          </div>
                        </div>
                      </div>

                      {/* Solar savings */}
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-3">☀️ Solar Impact</p>
                        <div className="space-y-2">
                          {[
                            { label: 'Solar Generated', value: `${bill.totalSolarUnits} kWh`, color: 'text-green-600 font-bold' },
                            { label: 'Without Solar', value: `$${bill.gridCost}`, color: 'text-gray-500 line-through' },
                            { label: 'Actual Bill', value: `$${bill.totalDue}`, color: 'text-gray-700 dark:text-gray-300' },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="flex justify-between text-xs">
                              <span className="text-gray-500">{label}</span>
                              <span className={color}>{value}</span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-green-200 dark:border-green-800">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-green-700 font-semibold">You Saved</span>
                              <span className="text-xl font-bold text-green-600">${bill.solarSavings}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Leaf size={11} className="text-green-500" />
                              <span className="text-xs text-green-600">{Math.round(bill.totalSolarUnits * 0.43 * 10)/10} kg CO₂ avoided</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
