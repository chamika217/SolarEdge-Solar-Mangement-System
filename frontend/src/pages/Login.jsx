import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { Sun, Mail, Lock, Loader, ArrowLeft } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: 'admin@solar.com', password: 'admin123' })
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (result.success) {
      toast.success('Welcome back!')
      const role = JSON.parse(localStorage.getItem('user'))?.role
      navigate(role === 'admin' ? '/dashboard' : '/user')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-solar-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-solar-500 rounded-2xl shadow-lg shadow-solar-200 mb-4">
            <Sun size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SolarEdge</h1>
          <p className="text-gray-500 text-sm mt-1">Solar Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required className="input pl-9" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})} placeholder="admin@solar.com" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" required className="input pl-9" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2 py-2.5">
              {loading ? <><Loader size={15} className="animate-spin" />Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 p-3 bg-solar-50 rounded-xl space-y-1">
            <p className="text-xs font-semibold text-solar-700">Demo Credentials</p>
            <p className="text-xs text-solar-600">Admin → admin@solar.com / admin123</p>
            <p className="text-xs text-solar-600">User &nbsp;→ user@solar.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
