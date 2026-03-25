import { ensureRoom } from '../state.js'
import { handleCodeChange, handleCursorMove } from './sync.js'
import { openRouterChat, SYSTEM_PROMPT } from '../lib/openrouter.js'

const COLORS = ['#7C3AED', '#2DD4BF']

export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('join_room', ({ roomCode, userName, userId, isCreator }) => {
      const code = String(roomCode || '').toUpperCase()
      if (!code) return

      socket.data.roomCode = code
      socket.data.userName = userName || 'Anonymous'
      socket.data.userId = userId || socket.id

      const state = ensureRoom(code)
      const existingCount = state.participants.size
      let color = state.participants.has(socket.data.userId)
        ? state.participants.get(socket.data.userId).color
        : null

      if (!color) {
        color = isCreator ? COLORS[0] : COLORS[1]
      }

      socket.data.color = color

      state.participants.set(socket.data.userId, {
        userId: socket.data.userId,
        userName: socket.data.userName,
        color,
      })

      socket.join(code)

      socket.to(code).emit('partner_joined', {
        userId: socket.data.userId,
        userName: socket.data.userName,
        color,
      })

      // send current code snapshot to the joiner
      socket.emit('code_update', {
        delta: null,
        fullCode: state.code || '',
        userId: 'server',
      })
    })

    socket.on('code_change', (payload) => handleCodeChange(io, socket, payload))
    socket.on('cursor_move', (payload) => handleCursorMove(io, socket, payload))

    socket.on('chat_message', ({ roomCode, userId, message }) => {
      const code = String(roomCode || '').toUpperCase()
      if (!code || !message) return
      socket.to(code).emit('chat_message', { roomCode: code, userId, message })
    })

    socket.on('phase_change', ({ roomCode, newPhase, elapsedMs, phaseElapsedMs, phaseTimeLimitMs }) => {
      const code = String(roomCode || '').toUpperCase()
      if (!code || !newPhase) return
      const state = ensureRoom(code)

      // Keep timer state in memory for later evaluation/replay.
      if (!state.session) state.session = { startedAt: Date.now(), sessionId: null, phase: newPhase }
      state.session.phase = newPhase

      ;(async () => {
        try {
          const userInstruction = `PHASE_TRANSITION to: ${newPhase}. Provide the next Socratic interviewer message for this phase. 1-3 sentences only.`
          state.history.push({
            role: 'user',
            content: userInstruction,
            ts: Date.now(),
            userId: 'system',
            userName: 'Interviewer',
          })

          const routerMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...state.history.slice(-40).map((m) =>
              m.role === 'user'
                ? { role: 'user', content: `${m.userName || 'Candidate'}: ${m.content}` }
                : { role: 'assistant', content: m.content },
            ),
          ]

          const content = await openRouterChat(routerMessages, { temperature: 0.6, max_tokens: 220 })
          state.history.push({ role: 'assistant', content, ts: Date.now() })

          io.to(code).emit('ai_message', { content, type: 'phase_change' })
          io.to(code).emit('timer_update', {
            elapsed: elapsedMs ?? 0,
            phase: newPhase,
            phaseElapsed: phaseElapsedMs ?? 0,
            phaseTimeLimit: phaseTimeLimitMs ?? null,
          })
        } catch {
          io.to(code).emit('ai_message', { content: `Phase changed to ${newPhase}.`, type: 'phase_change' })
          io.to(code).emit('timer_update', {
            elapsed: elapsedMs ?? 0,
            phase: newPhase,
            phaseElapsed: phaseElapsedMs ?? 0,
            phaseTimeLimit: phaseTimeLimitMs ?? null,
          })
        }
      })()
    })

    socket.on('timer_update', ({ roomCode, elapsed, phase, phaseElapsed, phaseTimeLimit }) => {
      const code = String(roomCode || socket.data.roomCode || '').toUpperCase()
      if (!code) return
      // Broadcast timer state for partners.
      io.to(code).emit('timer_update', {
        elapsed: typeof elapsed === 'number' ? elapsed : 0,
        phase: phase || 'Understand',
        phaseElapsed: typeof phaseElapsed === 'number' ? phaseElapsed : 0,
        phaseTimeLimit: phaseTimeLimit ?? null,
      })
    })

    socket.on('end_session', ({ roomCode }) => {
      const code = String(roomCode || '').toUpperCase()
      if (!code) return
      io.to(code).emit('session_ended', {
        trigger: 'manual',
        redirect: `/results/${code}`,
      })
    })

    socket.on('disconnect', () => {
      const code = socket.data.roomCode
      const userId = socket.data.userId
      if (!code || !userId) return
      const state = ensureRoom(code)
      state.participants.delete(userId)
      state.cursors.delete(userId)
      socket.to(code).emit('partner_left', { userId })
    })
  })
}

