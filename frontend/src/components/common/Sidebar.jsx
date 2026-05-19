import { NavLink } from 'react-router-dom'
import { Sun, LayoutDashboard, Zap, BarChart2, Bell, Settings, Users, LogOut, Moon, ClipboardList, DollarSign } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/context/SocketContext'
import { useTheme } from '@/context/ThemeContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/panels', icon: Zap, label: 'Solar Panels' },
  { to: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/dashboard/alerts', icon: Bell, label: 'Alerts' },
  { to: '/dashboard/billing', icon: DollarSign, label: 'Billing' },
  { to: '/dashboard/users', icon: Users, label: 'Users' },
  { to: '/dashboard/audit', icon: ClipboardList, label: 'Audit Logs' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ alertCount }) {
  const { user, logout } = useAuth()
  const { connected } = useSocket()
  const { dark, toggle } = useTheme()

  return (
    <aside className="w-56 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-solar-500 rounded-xl flex items-center justify-center shadow-sm">
            <Sun size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">SolarEdge</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full w-fit ${connected ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 pulse-dot' : 'bg-gray-400'}`} />
          {connected ? 'Live' : 'Offline'}
        </div>
        <button onClick={toggle} className="text-gray-400 hover:text-solar-500 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-xs text-gray-400 px-3 pb-2 pt-1 uppercase tracking-wider">Menu</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive ? 'bg-solar-50 dark:bg-solar-900/30 text-solar-700 dark:text-solar-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`
            }>
            <Icon size={17} />
            {label}
            {label === 'Alerts' && alertCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{alertCount}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-7 h-7 bg-solar-200 rounded-full flex items-center justify-center text-solar-700 text-xs font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400">admin</p>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors"><LogOut size={15} /></button>
        </div>
      </div>
    </aside>
  )
}
