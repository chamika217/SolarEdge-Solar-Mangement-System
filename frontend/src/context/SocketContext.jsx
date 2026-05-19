import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [liveData, setLiveData] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const s = io('/', { auth: { token } })
    setSocket(s)

    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))
    s.on('liveData', data => setLiveData(data))

    return () => s.disconnect()
  }, [])

  return (
    <SocketContext.Provider value={{ socket, liveData, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
