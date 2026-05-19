import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useEffect, useState } from 'react'
import api from '@/utils/api'

export default function Layout() {
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const { data } = await api.get('/alerts?unread=true&limit=1')
        setAlertCount(data.unreadCount || 0)
      } catch {}
    }
    fetchAlertCount()
    const interval = setInterval(fetchAlertCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar alertCount={alertCount} />
      <main className="flex-1 overflow-y-auto">
        <Outlet context={{ setAlertCount }} />
      </main>
    </div>
  )
}
