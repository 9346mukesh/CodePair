import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const STORAGE_KEY = (roomCode) => `codepair:${roomCode}:backup`

export function useRoom({ roomCode, socket, self }) {
  const [participants, setParticipants] = useState([])
  const [code, setCode] = useState(() => {
    if (!roomCode) return ''
    return localStorage.getItem(STORAGE_KEY(roomCode)) || ''
  })
  const [cursors, setCursors] = useState({})
  const [partnerConnected, setPartnerConnected] = useState(false)
  const [partnerDisconnectedAt, setPartnerDisconnectedAt] = useState(null)
  const [banner, setBanner] = useState(null)

  const lastSaveRef = useRef(0)

  const selfColor = useMemo(() => self?.color || '#7C3AED', [self])

  // Code is initialized from localStorage once per room mount.

  useEffect(() => {
    if (!roomCode) return
    const id = setInterval(() => {
      localStorage.setItem(STORAGE_KEY(roomCode), code || '')
      lastSaveRef.current = Date.now()
    }, 30_000)
    return () => clearInterval(id)
  }, [code, roomCode])

  useEffect(() => {
    if (!socket) return

    const onPartnerJoined = (payload) => {
      setPartnerConnected(true)
      setPartnerDisconnectedAt(null)
      setBanner({ type: 'success', text: 'Partner connected!' })
      setParticipants((prev) => {
        const next = [...prev]
        if (!next.find((p) => p.userId === payload.userId)) next.push(payload)
        return next
      })
    }

    const onPartnerLeft = ({ userId }) => {
      setPartnerConnected(false)
      setPartnerDisconnectedAt(Date.now())
      setBanner({ type: 'warn', text: 'Partner disconnected. Reconnecting…' })
      setParticipants((prev) => prev.filter((p) => p.userId !== userId))
    }

    const onCodeUpdate = ({ fullCode, userId }) => {
      if (userId === self?.userId) return
      setCode(fullCode ?? '')
    }

    const onCursorUpdate = ({ userId, position, color }) => {
      setCursors((prev) => ({ ...prev, [userId]: { position, color } }))
    }

    socket.on('partner_joined', onPartnerJoined)
    socket.on('partner_left', onPartnerLeft)
    socket.on('code_update', onCodeUpdate)
    socket.on('cursor_update', onCursorUpdate)

    return () => {
      socket.off('partner_joined', onPartnerJoined)
      socket.off('partner_left', onPartnerLeft)
      socket.off('code_update', onCodeUpdate)
      socket.off('cursor_update', onCursorUpdate)
    }
  }, [socket, self?.userId])

  const emitCodeChange = useCallback(
    ({ fullCode, cursorPosition, delta = null }) => {
      setCode(fullCode)
      socket?.emit('code_change', { roomCode, delta, fullCode, cursorPosition })
    },
    [roomCode, socket],
  )

  const emitCursorMove = useCallback(
    (position) => {
      socket?.emit('cursor_move', { roomCode, userId: self?.userId, position })
      setCursors((prev) => ({ ...prev, [self?.userId]: { position, color: selfColor } }))
    },
    [roomCode, self?.userId, selfColor, socket],
  )

  return {
    participants,
    setParticipants,
    partnerConnected,
    partnerDisconnectedAt,
    code,
    setCode,
    cursors,
    banner,
    setBanner,
    emitCodeChange,
    emitCursorMove,
  }
}

