import { ensureRoom } from '../state.js'

export function handleCodeChange(io, socket, payload) {
  const { roomCode, delta, fullCode, cursorPosition } = payload || {}
  if (!roomCode) return
  const code = String(roomCode).toUpperCase()
  const state = ensureRoom(code)
  state.code = typeof fullCode === 'string' ? fullCode : state.code
  state.cursors.set(socket.data.userId, cursorPosition || null)

  socket.to(code).emit('code_update', {
    delta: delta || null,
    fullCode: state.code,
    userId: socket.data.userId,
  })
}

export function handleCursorMove(io, socket, payload) {
  const { roomCode, userId, position } = payload || {}
  if (!roomCode) return
  const code = String(roomCode).toUpperCase()
  const state = ensureRoom(code)
  state.cursors.set(userId, position || null)

  socket.to(code).emit('cursor_update', {
    userId,
    position,
    color: socket.data.color,
  })
}

