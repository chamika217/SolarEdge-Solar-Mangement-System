import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { SocketProvider } from '@/context/SocketContext'
import { ThemeProvider } from '@/context/ThemeContext'
import Layout from '@/components/common/Layout'
import UserLayout from '@/components/common/UserLayout'
import LandingPage from '@/pages/LandingPage'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Panels from '@/pages/Panels'
import Analytics from '@/pages/Analytics'
import Alerts from '@/pages/Alerts'
import Settings from '@/pages/Settings'
import AdminUsers from '@/pages/AdminUsers'
import AuditLogs from '@/pages/AuditLogs'
import Billing from '@/pages/Billing'
import UserDashboard from '@/pages/UserDashboard'
import UserPanels from '@/pages/UserPanels'
import UserAlerts from '@/pages/UserAlerts'
import UserProfile from '@/pages/UserProfile'
import UserBilling from '@/pages/UserBilling'

const AdminRoute = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/user" replace />
  return children
}

const UserRoute = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* Admin */}
      <Route path="/dashboard" element={<AdminRoute><SocketProvider><Layout /></SocketProvider></AdminRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="panels" element={<Panels />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="billing" element={<Billing />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* User */}
      <Route path="/user" element={<UserRoute><SocketProvider><UserLayout /></SocketProvider></UserRoute>}>
        <Route index element={<UserDashboard />} />
        <Route path="panels" element={<UserPanels />} />
        <Route path="billing" element={<UserBilling />} />
        <Route path="alerts" element={<UserAlerts />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}
