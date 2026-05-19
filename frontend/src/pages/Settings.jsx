import { useEffect, useState } from 'react'
import { Settings as SettingsIcon, Save, Sun, Bell, Zap, DollarSign } from 'lucide-react'
import api from '@/utils/api'
import toast from 'react-hot-toast'

const INVERTERS = ['SMA Sunny Boy 10.0', 'Fronius Symo 8.2', 'Enphase IQ8+', 'SolarEdge SE10000H', 'Huawei SUN2000']

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex cursor-pointer">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
    <div className="w-9 h-5 bg-gray-200 peer-checked:bg-solar-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
  </label>
)

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data)).catch(() => toast.error('Failed to load settings')).finally(() => setLoading(false))
  }, [])

  const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings', settings)
      toast.success('Settings saved successfully!')
    } catch { toast.error('Failed to save settings') }
    finally { setSaving(false) }
  }

  if (loading || !settings) return (
    <div className="flex items-center justify-center h-64">
      <Sun size={28} className="animate-spin text-solar-400" />
    </div>
  )

  const Section = ({ title, icon: Icon, children }) => (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
        <div className="w-8 h-8 bg-solar-50 rounded-lg flex items-center justify-center">
          <Icon size={16} className="text-solar-600" />
        </div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )

  const Row = ({ title, desc, children }) => (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure your solar management system</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save size={15} />{saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* System */}
        <Section title="System Configuration" icon={SettingsIcon}>
          <Row title="System Name">
            <input className="input w-48 text-sm" value={settings.systemName || ''} onChange={e => update('systemName', e.target.value)} />
          </Row>
          <Row title="Auto-start at sunrise" desc="Begin monitoring when sun rises">
            <Toggle checked={!!settings.autoStartSunrise} onChange={v => update('autoStartSunrise', v)} />
          </Row>
          <Row title="Grid export mode" desc="Sell excess energy back to grid">
            <Toggle checked={!!settings.gridExportMode} onChange={v => update('gridExportMode', v)} />
          </Row>
          <Row title="Auto reporting" desc="Send monthly performance reports">
            <Toggle checked={!!settings.autoReporting} onChange={v => update('autoReporting', v)} />
          </Row>
          <Row title="Data refresh interval">
            <select className="input w-48 text-sm" value={settings.dataRefreshInterval} onChange={e => update('dataRefreshInterval', Number(e.target.value))}>
              <option value={15}>Every 15 seconds</option>
              <option value={30}>Every 30 seconds</option>
              <option value={60}>Every 1 minute</option>
              <option value={300}>Every 5 minutes</option>
            </select>
          </Row>
        </Section>

        {/* Alerts */}
        <Section title="Alert Thresholds" icon={Bell}>
          <Row title="Real-time alerts" desc="Push notifications for critical issues">
            <Toggle checked={!!settings.realTimeAlerts} onChange={v => update('realTimeAlerts', v)} />
          </Row>
          <Row title="Email notifications">
            <Toggle checked={!!settings.emailNotifications} onChange={v => update('emailNotifications', v)} />
          </Row>
          {settings.emailNotifications && (
            <Row title="Notification email">
              <input type="email" className="input w-48 text-sm" value={settings.notificationEmail || ''} onChange={e => update('notificationEmail', e.target.value)} placeholder="email@example.com" />
            </Row>
          )}
          <Row title="Min efficiency threshold (%)" desc="Alert when panel drops below this">
            <div className="flex items-center gap-2">
              <input type="range" min={20} max={90} value={settings.minEfficiencyThreshold} onChange={e => update('minEfficiencyThreshold', Number(e.target.value))} className="w-28 accent-solar-500" />
              <span className="text-sm font-semibold text-solar-600 w-10 text-right">{settings.minEfficiencyThreshold}%</span>
            </div>
          </Row>
          <Row title="Max temperature threshold (°C)" desc="Alert when temp exceeds this">
            <div className="flex items-center gap-2">
              <input type="range" min={50} max={100} value={settings.maxTemperatureThreshold} onChange={e => update('maxTemperatureThreshold', Number(e.target.value))} className="w-28 accent-solar-500" />
              <span className="text-sm font-semibold text-solar-600 w-10 text-right">{settings.maxTemperatureThreshold}°C</span>
            </div>
          </Row>
        </Section>

        {/* Inverter */}
        <Section title="Inverter & Hardware" icon={Zap}>
          <Row title="Inverter Model">
            <select className="input w-52 text-sm" value={settings.inverterModel || ''} onChange={e => update('inverterModel', e.target.value)}>
              {INVERTERS.map(i => <option key={i}>{i}</option>)}
            </select>
          </Row>
        </Section>

        {/* Billing */}
        <Section title="Billing & Currency" icon={DollarSign}>
          <Row title="Currency">
            <select className="input w-48 text-sm" value={settings.currency || 'USD'} onChange={e => update('currency', e.target.value)}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="LKR">LKR (Rs.)</option>
            </select>
          </Row>
          <Row title="Electricity rate (per kWh)" desc="Used to calculate cost savings">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">$</span>
              <input type="number" step="0.01" min="0" className="input w-24 text-sm" value={settings.electricityRate || 0.20} onChange={e => update('electricityRate', Number(e.target.value))} />
            </div>
          </Row>
        </Section>
      </div>

      {/* Save footer */}
      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-8">
          <Save size={15} />{saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}
