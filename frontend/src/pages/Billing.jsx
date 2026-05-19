import { useEffect, useState } from 'react'
import { DollarSign, Calculator, Plus, CheckCircle, Clock, AlertTriangle, Zap, TrendingDown, Sun, FileText, Trash2 } from 'lucide-react'
import api from '@/utils/api'
import toast from 'react-hot-toast'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const STATUS_MAP = {
  paid: { cls: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Paid' },
  pending: { cls: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
  overdue: { cls: 'bg-red-100 text-red-700', icon: AlertTriangle, label: 'Overdue' }
}

const defaultRate = { name: '', ratePerKwh: 0.20, solarRatePerKwh: 0.10, fixedCharge: 5, taxPercent: 8, currency: 'USD', isDefault: false }
const defaultCalc = { userId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), rateId: '', gridUnits: 0 }

export default function Billing() {
  const [bills, setBills] = useState([])
  const [rates, setRates] = useState([])
  const [summary, setSummary] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('bills')
  const [rateModal, setRateModal] = useState(false)
  const [calcModal, setCalcModal] = useState(false)
  const [rateForm, setRateForm] = useState(defaultRate)
  const [calcForm, setCalcForm] = useState(defaultCalc)
  const [calcResult, setCalcResult] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    try {
      const [b, r, s, u] = await Promise.all([
        api.get('/billing/bills'),
        api.get('/billing/rates'),
        api.get('/billing/summary'),
        api.get('/auth/users')
      ])
      setBills(b.data)
      setRates(r.data)
      setSummary(s.data)
      setUsers(u.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleCalculate = async () => {
    if (!calcForm.userId) return toast.error('Please select a customer')
    setSaving(true)
    try {
      const { data } = await api.post('/billing/calculate', calcForm)
      setCalcResult(data)
      toast.success('Bill calculated!')
      fetchAll()
    } catch (e) { toast.error(e.response?.data?.message || 'Calculation failed') }
    finally { setSaving(false) }
  }

  const handleSaveRate = async () => {
    if (!rateForm.name) return toast.error('Rate name required')
    setSaving(true)
    try {
      await api.post('/billing/rates', rateForm)
      toast.success('Rate saved!')
      setRateModal(false)
      setRateForm(defaultRate)
      fetchAll()
    } catch (e) { toast.error('Failed to save rate') }
    finally { setSaving(false) }
  }

  const handlePay = async (id) => {
    try {
      await api.put(`/billing/bills/${id}/pay`)
      toast.success('Marked as paid!')
      fetchAll()
    } catch { toast.error('Failed to update') }
  }

  const handleDeleteRate = async (id) => {
    if (!confirm('Delete this rate?')) return
    try {
      await api.delete(`/billing/rates/${id}`)
      toast.success('Rate deleted')
      fetchAll()
    } catch { toast.error('Failed to delete') }
  }

  const printInvoice = (bill) => {
    const win = window.open('', '_blank')
    win.document.write(`
<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<title>Invoice - ${bill.customer?.name}</title>
<style>
  body{font-family:Arial,sans-serif;margin:40px;color:#1f2937}
  .header{display:flex;justify-content:space-between;align-items:start;margin-bottom:32px;padding-bottom:16px;border-bottom:2px solid #f59e0b}
  .logo{display:flex;align-items:center;gap:10px}
  .logo-icon{width:40px;height:40px;background:#f59e0b;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:20px}
  h1{font-size:20px;font-weight:700;margin:0}
  .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:${bill.status==='paid'?'#d1fae5':'#fef3c7'};color:${bill.status==='paid'?'#065f46':'#92400e'}}
  table{width:100%;border-collapse:collapse;margin:16px 0}
  th{background:#f9fafb;padding:10px 14px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase}
  td{padding:10px 14px;border-bottom:1px solid #f3f4f6;font-size:13px}
  .total-row td{font-weight:700;font-size:15px;background:#fffbeb}
  .savings{color:#059669;font-weight:600}
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
    <p style="font-weight:600;margin:0">${bill.customer?.name}</p>
    <p style="color:#6b7280;font-size:13px;margin:2px 0">${bill.customer?.email}</p>
  </div>
  <div><p style="font-size:11px;color:#6b7280;margin-bottom:4px">BILLING PERIOD</p>
    <p style="font-weight:600;margin:0">${MONTHS[bill.month-1]} ${bill.year}</p>
    <p style="color:#6b7280;font-size:13px;margin:2px 0">Rate: ${bill.billingRate?.name || 'Standard'}</p>
  </div>
</div>

<table>
  <thead><tr><th>Description</th><th>Units (kWh)</th><th>Rate</th><th>Amount</th></tr></thead>
  <tbody>
    <tr><td>Grid Electricity Consumed</td><td>${bill.totalGridUnits}</td><td>$${bill.billingRate?.ratePerKwh}/kWh</td><td>$${bill.actualBill}</td></tr>
    <tr><td>Fixed Monthly Charge</td><td>-</td><td>-</td><td>$${bill.fixedCharge}</td></tr>
    <tr><td>Tax (${bill.billingRate?.taxPercent || 0}%)</td><td>-</td><td>-</td><td>$${bill.taxAmount}</td></tr>
    <tr class="total-row"><td colspan="3">TOTAL DUE</td><td>$${bill.totalDue}</td></tr>
  </tbody>
</table>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-top:16px">
  <p style="font-size:13px;font-weight:600;color:#065f46;margin:0 0 8px">☀️ Solar Savings Summary</p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
    <div><p style="font-size:11px;color:#6b7280;margin:0">Solar Generated</p><p style="font-weight:700;color:#059669;margin:4px 0">${bill.totalSolarUnits} kWh</p></div>
    <div><p style="font-size:11px;color:#6b7280;margin:0">Without Solar (Full Grid)</p><p style="font-weight:700;margin:4px 0">$${bill.gridCost}</p></div>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Billing & Calculations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Customer electricity cost management</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setRateModal(true)} className="btn-secondary flex items-center gap-2 text-sm">
            <Plus size={15} />Add Rate
          </button>
          <button onClick={() => { setCalcResult(null); setCalcModal(true) }} className="btn-primary flex items-center gap-2 text-sm">
            <Calculator size={15} />Calculate Bill
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { icon: DollarSign, label: 'Total Billed', value: `$${summary.totalBilled}`, color: 'bg-blue-50 text-blue-600' },
            { icon: TrendingDown, label: 'Total Savings', value: `$${summary.totalSavings}`, color: 'bg-green-50 text-green-600' },
            { icon: Zap, label: 'Solar Generated', value: `${summary.totalSolarKwh} kWh`, color: 'bg-solar-50 text-solar-600' },
            { icon: FileText, label: 'Total Bills', value: `${summary.billCount} (${summary.paid} paid)`, color: 'bg-purple-50 text-purple-600' }
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card p-4">
              <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center mb-3`}><Icon size={17} /></div>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5">
        {['bills','rates'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize border transition-colors ${tab===t ? 'bg-solar-500 text-white border-solar-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            {t === 'bills' ? '🧾 Bills' : '⚡ Rates'}
          </button>
        ))}
      </div>

      {/* Bills Table */}
      {tab === 'bills' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
              <tr>
                {['Customer','Period','Solar kWh','Grid kWh','Without Solar','Savings','Total Due','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:4}).map((_,i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({length:9}).map((_,j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse"/></td>)}
                  </tr>
                ))
              ) : bills.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">No bills yet. Click "Calculate Bill" to generate one.</td></tr>
              ) : bills.map(bill => {
                const st = STATUS_MAP[bill.status] || STATUS_MAP.pending
                const Icon = st.icon
                return (
                  <tr key={bill._id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-xs">{bill.customer?.name}</p>
                        <p className="text-xs text-gray-400">{bill.customer?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium">{MONTHS[bill.month-1]} {bill.year}</td>
                    <td className="px-4 py-3 text-xs text-green-600 font-semibold">{bill.totalSolarUnits}</td>
                    <td className="px-4 py-3 text-xs">{bill.totalGridUnits}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 line-through">${bill.gridCost}</td>
                    <td className="px-4 py-3 text-xs text-green-600 font-bold">-${bill.solarSavings}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">${bill.totalDue}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 w-fit text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>
                        <Icon size={10} />{st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {bill.status !== 'paid' && (
                          <button onClick={() => handlePay(bill._id)} className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded-lg transition-colors font-medium">
                            Pay
                          </button>
                        )}
                        <button onClick={() => printInvoice(bill)} className="text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors font-medium flex items-center gap-1">
                          <FileText size={11} />Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Rates Table */}
      {tab === 'rates' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100">
              <tr>
                {['Rate Name','Grid Rate/kWh','Fixed Charge','Tax %','Currency','Default','Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rates.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No rates yet. Click "Add Rate" to create one.</td></tr>
              ) : rates.map(rate => (
                <tr key={rate._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">{rate.name}</td>
                  <td className="px-5 py-3 font-semibold text-solar-600">${rate.ratePerKwh}/kWh</td>
                  <td className="px-5 py-3">${rate.fixedCharge}</td>
                  <td className="px-5 py-3">{rate.taxPercent}%</td>
                  <td className="px-5 py-3">{rate.currency}</td>
                  <td className="px-5 py-3">{rate.isDefault ? <span className="badge-online">Default</span> : '-'}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleDeleteRate(rate._id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Calculate Bill Modal */}
      {calcModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2"><Calculator size={18} className="text-solar-500" />Calculate Customer Bill</h2>

            {!calcResult ? (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="label">Customer *</label>
                    <select className="input" value={calcForm.userId} onChange={e => setCalcForm({...calcForm, userId: e.target.value})}>
                      <option value="">Select customer...</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.name} — {u.email}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Month</label>
                      <select className="input" value={calcForm.month} onChange={e => setCalcForm({...calcForm, month: Number(e.target.value)})}>
                        {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Year</label>
                      <input type="number" className="input" value={calcForm.year} onChange={e => setCalcForm({...calcForm, year: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Grid Units Used (kWh)</label>
                    <input type="number" step="0.1" min="0" className="input" value={calcForm.gridUnits} onChange={e => setCalcForm({...calcForm, gridUnits: Number(e.target.value)})} placeholder="Enter grid kWh consumed" />
                    <p className="text-xs text-gray-400 mt-1">Solar units are automatically calculated from system data</p>
                  </div>
                  <div>
                    <label className="label">Billing Rate</label>
                    <select className="input" value={calcForm.rateId} onChange={e => setCalcForm({...calcForm, rateId: e.target.value})}>
                      <option value="">Use default rate</option>
                      {rates.map(r => <option key={r._id} value={r._id}>{r.name} — ${r.ratePerKwh}/kWh</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setCalcModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={handleCalculate} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {saving ? 'Calculating...' : <><Calculator size={15} />Calculate</>}
                  </button>
                </div>
              </>
            ) : (
              /* Result */
              <div>
                <div className="bg-gradient-to-r from-solar-50 to-green-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Bill for {calcResult.customer?.name} — {MONTHS[calcResult.month-1]} {calcResult.year}</p>
                  <p className="text-3xl font-bold text-gray-900">${calcResult.totalDue}</p>
                  <p className="text-sm text-green-600 font-medium mt-1">Saved ${calcResult.solarSavings} with solar ☀️</p>
                </div>

                <div className="space-y-2 mb-4">
                  {[
                    { label: 'Solar Generated', value: `${calcResult.totalSolarUnits} kWh`, color: 'text-green-600' },
                    { label: 'Grid Units Used', value: `${calcResult.totalGridUnits} kWh`, color: 'text-gray-700' },
                    { label: 'Without Solar (full grid)', value: `$${calcResult.gridCost}`, color: 'text-red-400 line-through' },
                    { label: 'Solar Savings', value: `-$${calcResult.solarSavings}`, color: 'text-green-600 font-bold' },
                    { label: 'Electricity Bill', value: `$${calcResult.actualBill}`, color: 'text-gray-700' },
                    { label: 'Fixed Charge', value: `$${calcResult.fixedCharge}`, color: 'text-gray-700' },
                    { label: 'Tax', value: `$${calcResult.taxAmount}`, color: 'text-gray-700' },
                    { label: 'TOTAL DUE', value: `$${calcResult.totalDue}`, color: 'text-gray-900 font-bold text-base' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between text-sm border-b border-gray-50 pb-2">
                      <span className="text-gray-500">{label}</span>
                      <span className={color}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => { setCalcResult(null); setCalcModal(false) }} className="btn-secondary flex-1">Close</button>
                  <button onClick={() => printInvoice(calcResult)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <FileText size={15} />Print Invoice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Rate Modal */}
      {rateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-5">Add Billing Rate</h2>
            <div className="space-y-3">
              <div><label className="label">Rate Name *</label><input className="input" value={rateForm.name} onChange={e => setRateForm({...rateForm, name: e.target.value})} placeholder="e.g. Standard Residential" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Grid Rate (per kWh)</label><input type="number" step="0.01" className="input" value={rateForm.ratePerKwh} onChange={e => setRateForm({...rateForm, ratePerKwh: Number(e.target.value)})} /></div>
                <div><label className="label">Fixed Monthly Charge</label><input type="number" step="0.01" className="input" value={rateForm.fixedCharge} onChange={e => setRateForm({...rateForm, fixedCharge: Number(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Tax %</label><input type="number" step="0.1" className="input" value={rateForm.taxPercent} onChange={e => setRateForm({...rateForm, taxPercent: Number(e.target.value)})} /></div>
                <div><label className="label">Currency</label>
                  <select className="input" value={rateForm.currency} onChange={e => setRateForm({...rateForm, currency: e.target.value})}>
                    <option>USD</option><option>LKR</option><option>EUR</option><option>GBP</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input type="checkbox" id="isDefault" checked={rateForm.isDefault} onChange={e => setRateForm({...rateForm, isDefault: e.target.checked})} className="accent-solar-500" />
                <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">Set as default rate</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setRateModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSaveRate} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Rate'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
