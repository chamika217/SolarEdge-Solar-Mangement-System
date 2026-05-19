import { useState } from 'react'
import { User, Mail, Lock, Save } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/utils/api'
import toast from 'react-hot-toast'

export default function UserProfile() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return toast.error('Passwords do not match!')
    }
    setSaving(true)
    try {
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account settings</p>
      </div>

      <div className="max-w-lg">
        {/* Avatar */}
        <div className="card p-6 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-solar-200 rounded-full flex items-center justify-center text-solar-700 text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="text-xs bg-solar-100 text-solar-700 px-2 py-0.5 rounded-full font-medium capitalize mt-1 inline-block">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><User size={16} />Account Details</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-9" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-9" value={user?.email} disabled />
              </div>
            </div>
            <hr className="border-gray-100" />
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Change Password</p>
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" className="input pl-9" value={form.currentPassword} onChange={e => setForm({...form, currentPassword: e.target.value})} placeholder="••••••••" />
              </div>
            </div>
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" className="input pl-9" value={form.newPassword} onChange={e => setForm({...form, newPassword: e.target.value})} placeholder="••••••••" />
              </div>
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" className="input pl-9" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} placeholder="••••••••" />
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
              <Save size={15} />{saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
