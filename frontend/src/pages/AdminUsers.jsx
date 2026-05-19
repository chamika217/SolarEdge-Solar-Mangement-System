import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, User, Sun, Shield, Eye } from 'lucide-react'
import api from '@/utils/api'
import toast from 'react-hot-toast'

const defaultForm = { name: '', email: '', password: '', role: 'viewer' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users')
      setUsers(data)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('All fields required')
    setSaving(true)
    try {
      const { data } = await api.post('/auth/register', form)
      setUsers(prev => [data, ...prev])
      toast.success('User created!')
      setModal(false)
      setForm(defaultForm)
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create user') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    try {
      await api.delete(`/auth/users/${id}`)
      setUsers(prev => prev.filter(u => u._id !== id))
      toast.success('User deleted')
    } catch { toast.error('Failed to delete') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Sun size={28} className="animate-spin text-solar-400" /></div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} users registered</p>
        </div>
        <button onClick={() => { setForm(defaultForm); setModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={16} />Add User
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-solar-100 rounded-full flex items-center justify-center text-solar-700 font-semibold text-sm">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-500">{u.email}</td>
                <td className="px-5 py-4">
                  <span className={`flex items-center gap-1 w-fit text-xs px-2 py-1 rounded-full font-medium ${u.role === 'admin' ? 'bg-solar-100 text-solar-700' : 'bg-blue-50 text-blue-700'}`}>
                    {u.role === 'admin' ? <Shield size={11} /> : <Eye size={11} />}
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-4">
                  <button onClick={() => handleDelete(u._id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-5">Add New User</h2>
            <div className="space-y-3">
              <div><label className="label">Full Name *</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" /></div>
              <div><label className="label">Email *</label><input type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@example.com" /></div>
              <div><label className="label">Password *</label><input type="password" className="input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" /></div>
              <div><label className="label">Role</label>
                <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="viewer">Viewer (User)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Create User'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
