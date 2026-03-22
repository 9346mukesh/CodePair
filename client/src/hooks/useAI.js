import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'

export function useAI({ roomCode, sessionId, userId, userName, socket }) {
  const [messages, setMessages] = useState([])
  const [notes, setNotes] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingNotes, setLoadingNotes] = useState(false)
  const abortRef = useRef(null)

  const sendMessage = useCallback(
    async (content) => {
      if (!content?.trim()) return
      setSending(true)
      const userMsg = {
        id: crypto.randomUUID(),
        role: 'user',
        userId,
        userName,
        content,
        ts: Date.now(),
      }
      setMessages((prev) => [...prev, userMsg])
      try {
        const res = await api.post('/api/ai/message', {
          roomCode,
          sessionId,
          userId,
          userName,
          message: content,
        })
        const ai = res.data?.content ?? ''
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'ai', content: ai, ts: Date.now() },
        ])
      } finally {
        setSending(false)
      }
    },
    [roomCode, sessionId, userId, userName],
  )

  const fetchNotes = useCallback(async () => {
    if (!roomCode || !sessionId) return
    setLoadingNotes(true)
    abortRef.current?.abort?.()
    const ac = new AbortController()
    abortRef.current = ac
    try {
      const res = await api.post(
        '/api/ai/notes',
        { roomCode, sessionId, userId, userName },
        { signal: ac.signal },
      )
      setNotes(res.data?.content ?? '')
    } finally {
      setLoadingNotes(false)
    }
  }, [roomCode, sessionId, userId, userName])

  useEffect(() => {
    if (!roomCode) return
    fetchNotes()
    const id = setInterval(fetchNotes, 60_000)
    return () => clearInterval(id)
  }, [fetchNotes, roomCode])

  useEffect(() => {
    if (!socket) return
    const onAiMessage = ({ content } = {}) => {
      if (!content) return
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'ai', content, ts: Date.now() }])
    }
    socket.on('ai_message', onAiMessage)
    return () => socket.off('ai_message', onAiMessage)
  }, [socket])

  return { messages, setMessages, notes, loadingNotes, sending, sendMessage }
}

