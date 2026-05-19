import { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, Zap, Thermometer, BarChart2, Sun } from 'lucide-react'
import api from '@/utils/api'
import toast from 'react-hot-toast'
import { useSocket } from '@/context/SocketContext'

const STATUS_MAP = { online: { cls: 'badge-online', label: 'Online' }, warning: { cls: 'badge-warning', label: 'Warning' }, offline: { cls: 'badge-offline', label: 'Offline' } }
const ARRAYS = ['Array A', 'Array B', 'Array C', 'Array D']
const INVERTERS = ['SMA Sunny Boy 10.0', 'Fronius Symo 8.2', 'Enphase IQ8+', 'SolarEdge SE10000H']

const defaultForm = { name: '', arrayGroup: 'Array A', capacity: 400, status: 'online', inverterModel: 'SMA Sunny Boy 10.0', installDate: '', notes: '' }

export default function Panels() {
  const [panels, setPanels] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(false)
  const [editPanel, setEditPanel] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const { liveData } = useSocket()

  const fetchPanels = async () => {
    try {
      const { data } = await api.get('/panels')
      setPanels(data)
    } catch { toast.error('Failed to load panels') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPanels() }, [])

  // Update live output from socket
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
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.arrayGroup.toLowerCase().includes(search.toLowerCase()))
    setFiltered(result)
  }, [panels, filter, search])

  const openAdd = () => { setEditPanel(null); setForm(defaultForm); setModal(true) }
  const openEdit = (p) => { setEditPanel(p); setForm({ name: p.name, arrayGroup: p.arrayGroup, capacity: p.capacity, status: p.status, inverterModel: p.inverterModel || INVERTERS[0], installDate: p.installDate?.split('T')[0] || '', notes: p.notes || '' }); setModal(true) }

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Panel name is required')
    setSaving(true)
    try {
      if (editPanel) {
        const { data } = await api.put(`/panels/${editPanel._id}`, form)
        setPanels(prev => prev.map(p => p._id === editPanel._id ? data : p))
        toast.success('Panel updated!')
      } else {
        const { data } = await api.post('/panels', form)
        setPanels(prev => [data, ...prev])
        toast.success('Panel added!')
      }
      setModal(false)
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this panel?')) return
    try {
      await api.delete(`/panels/${id}`)
      setPanels(prev => prev.filter(p => p._id !== id))
      toast.success('Panel deleted')
    } catch { toast.error('Delete failed') }
  }

  const counts = { all: panels.length, online: panels.filter(p => p.status==='online').length, warning: panels.filter(p => p.status==='warning').length, offline: panels.filter(p => p.status==='offline').length }

  if (loading) return <div className="flex items-center justify-center h-64"><Sun size={28} className="animate-spin text-solar-400" /></div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Solar Panels</h1>
          <p className="text-sm text-gray-500 mt-0.5">{panels.length} panels registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} />Add Panel</button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 text-sm" placeholder="Search panels..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {['all','online','warning','offline'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors border ${filter===s ? 'bg-solar-500 text-white border-solar-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {s} ({counts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(panel => {
          const eff = panel.currentEfficiency || 0
          const barColor = panel.status === 'online' ? 'bg-green-500' : panel.status === 'warning' ? 'bg-yellow-400' : 'bg-red-500'
          return (
            <div key={panel._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{panel.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{panel.arrayGroup}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={STATUS_MAP[panel.status]?.cls}>{STATUS_MAP[panel.status]?.label}</span>
                  <button onClick={() => openEdit(panel)} className="text-gray-400 hover:text-solar-600 p-1"><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(panel._id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={13} /></button>
                </div>
              </div>

              {/* Efficiency bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Efficiency</span><span className="font-medium">{eff}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${eff}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Zap, label: 'Output', value: `${panel.currentOutput || 0}W`, color: 'text-yellow-600' },
                  { icon: BarChart2, label: 'Capacity', value: `${panel.capacity}W`, color: 'text-blue-600' },
                  { icon: Thermometer, label: 'Temp', value: `${panel.currentTemperature || 0}°C`, color: 'text-red-500' },
                  { icon: Sun, label: 'Installed', value: panel.installDate ? new Date(panel.installDate).getFullYear() : '—', color: 'text-gray-500' }
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

        {/* Add card */}
        <button onClick={openAdd} className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-solar-300 hover:text-solar-500 transition-colors">
          <Plus size={24} />
          <span className="text-sm font-medium">Add New Panel</span>
        </button>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-5">{editPanel ? 'Edit Panel' : 'Add New Panel'}</h2>
            <div className="space-y-3">
              <div><label className="label">Panel Name *</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Array A — Row 5" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Array Group</label>
                  <select className="input" value={form.arrayGroup} onChange={e => setForm({...form, arrayGroup: e.target.value})}>
                    {ARRAYS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div><label className="label">Status</label>
                  <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="online">Online</option><option value="warning">Warning</option><option value="offline">Offline</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Capacity (W)</label><input type="number" className="input" value={form.capacity} onChange={e => setForm({...form, capacity: Number(e.target.value)})} /></div>
                <div><label className="label">Install Date</label><input type="date" className="input" value={form.installDate} onChange={e => setForm({...form, installDate: e.target.value})} /></div>
              </div>
              <div><label className="label">Inverter Model</label>
                <select className="input" value={form.inverterModel} onChange={e => setForm({...form, inverterModel: e.target.value})}>
                  {INVERTERS.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Optional notes..." /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editPanel ? 'Update' : 'Add Panel'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
