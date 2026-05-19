import { Outlet } from 'react-router-dom'
import UserSidebar from './UserSidebar'

export default function UserLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
