import { NavLink } from 'react-router-dom'
import { Sun, LayoutDashboard, Zap, Bell, User, LogOut, DollarSign } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/context/SocketContext'

const navItems = [
  { to: '/user', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/user/panels', icon: Zap, label: 'Solar Panels' },
  { to: '/user/billing', icon: DollarSign, label: 'My Bills' },
  { to: '/user/alerts', icon: Bell, label: 'Alerts' },
  { to: '/user/profile', icon: User, label: 'My Profile' },
]

export default function UserSidebar() {
  const { user, logout } = useAuth()
  const { connected } = useSocket()

  return (
    <aside className="w-56 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-solar-500 rounded-xl flex items-center justify-center shadow-sm">
            <Sun size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">SolarEdge</p>
            <p className="text-xs text-gray-400">User Portal</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full w-fit ${connected ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 pulse-dot' : 'bg-gray-400'}`} />
          {connected ? 'Live Data' : 'Connecting...'}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        <p className="text-xs text-gray-400 px-3 pb-2 pt-1 uppercase tracking-wider">Menu</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/user'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive ? 'bg-solar-50 dark:bg-solar-900/30 text-solar-700 dark:text-solar-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`
            }
          >
            <Icon size={17} />
            {label}
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
            <p className="text-xs text-gray-400">viewer</p>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors"><LogOut size={15} /></button>
        </div>
      </div>
    </aside>
  )
}
