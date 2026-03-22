import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'

export function useSocket({ roomCode, userName, userId, isCreator = false, autoConnect = true }) {
  const [connected, setConnected] = useState(false)
  const [lastDisconnectAt, setLastDisconnectAt] = useState(null)
  const [socket, setSocket] = useState(null)

  const serverUrl = useMemo(
    () => import.meta.env.VITE_SERVER_URL || 'http://localhost:3001',
    [],
  )

  useEffect(() => {
    if (!autoConnect) return

    const socket = io(serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      reconnectionDelayMax: 2000,
    })

    // Avoid setState synchronously during effect setup.
    setTimeout(() => setSocket(socket), 0)

    socket.on('connect', () => {
      setConnected(true)
      if (roomCode && userName && userId) {
        socket.emit('join_room', { roomCode, userName, userId, isCreator })
      }
    })

    socket.on('disconnect', () => {
      setConnected(false)
      setLastDisconnectAt(Date.now())
    })

    return () => {
      socket.disconnect()
      setSocket(null)
    }
  }, [autoConnect, roomCode, userId, userName, isCreator, serverUrl])

  return { socket, connected, lastDisconnectAt }
}

