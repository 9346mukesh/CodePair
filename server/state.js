export const roomState = new Map()
export const sessionSnapshots = new Map() // sessionId -> [{ code, takenAt }]
// roomCode => {
//   room: { code, language, difficulty, type, creatorName, creatorId, createdAt, status },
//   participants: Map(userId => { userId, userName, color }),
//   code: string,
//   cursors: Map(userId => position),
//   history: [{ role, content, ts, userId, userName }],
//   session: { sessionId, startedAt, phase }
// }

export function getRoom(code) {
  return roomState.get(code)
}

export function ensureRoom(code) {
  if (!roomState.has(code)) {
    roomState.set(code, {
      room: { code, createdAt: Date.now(), status: 'lobby' },
      participants: new Map(),
      code: '',
      cursors: new Map(),
      history: [],
      session: null, // { sessionId, startedAt, phase }
      snapshots: [], // [{takenAt, code}]
    })
  }
  return roomState.get(code)
}

