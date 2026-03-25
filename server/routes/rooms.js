import express from 'express'
import { customAlphabet } from 'nanoid'
import { ensureRoom, getRoom, sessionSnapshots } from '../state.js'
import { supabaseAdmin } from '../db/supabase.js'

const router = express.Router()
const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6)

router.post('/create', async (req, res) => {
  const { userName, difficulty, language, type, creatorId, problemId } = req.body || {}
  const code = nanoid()

  const state = ensureRoom(code)
  state.room = {
    code,
    difficulty: difficulty || 'Easy',
    language: language || 'Python',
    type: type || 'Mixed',
    creatorName: userName || 'Anonymous',
    creatorId: creatorId || null,
    problemId: problemId || null,
    createdAt: Date.now(),
    status: 'lobby',
  }

  if (supabaseAdmin) {
    await supabaseAdmin.from('rooms').insert({
      code,
      creator_id: creatorId || null,
      language: state.room.language,
      difficulty: state.room.difficulty,
      type: state.room.type,
      problem_id: state.room.problemId || null,
      status: 'lobby',
    })
  }

  return res.json({ code })
})

router.get('/:code', async (req, res) => {
  const code = String(req.params.code || '').trim().toUpperCase()
  let room = getRoom(code)
  if (!room && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('rooms').select('*').eq('code', code).maybeSingle()
    if (!error && data) {
      const state = ensureRoom(code)
      state.room = {
        code,
        difficulty: data.difficulty || 'Easy',
        language: data.language || 'Python',
        type: data.type || 'Mixed',
        creatorName: 'Unknown',
        creatorId: data.creator_id || null,
        problemId: data.problem_id || null,
        createdAt: Date.now(),
        status: data.status || 'lobby',
      }
      room = state
    }
  }
  if (!room) return res.status(404).json({ error: 'Room not found.' })
  return res.json({ ok: true, room: room.room })
})

router.post('/:code/start_session', async (req, res) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase()
    if (!code) return res.status(400).json({ error: 'room code required' })

    const { userName, userId, solo } = req.body || {}
    const state = ensureRoom(code)

    // Ensure session container exists in memory.
    if (!state.session) state.session = { startedAt: Date.now(), sessionId: null, phase: 'Understand' }

    // Persist in Supabase (if configured).
    if (supabaseAdmin && !state.session.sessionId) {
      const { data: roomRow, error: roomErr } = await supabaseAdmin
        .from('rooms')
        .select('id, language')
        .eq('code', code)
        .maybeSingle()

      if (roomErr) throw roomErr

      if (roomRow) {
        const { data: sessionRow, error: sessErr } = await supabaseAdmin
          .from('sessions')
          .insert({
            room_id: roomRow.id,
            started_at: new Date().toISOString(),
            language: state.room?.language || roomRow.language || 'Python',
          })
          .select('id')
          .single()

        if (sessErr) throw sessErr
        if (sessionRow?.id != null) {
          state.session.sessionId = sessionRow.id
          state.session.startedAt = Date.now()
          state.session.phase = 'Understand'
        }
      }
    }

    // Fallback local session id when Supabase isn't configured.
    if (!state.session.sessionId) {
      state.session.sessionId = `local-${code}-${Date.now()}`
      state.session.startedAt = Date.now()
      state.session.phase = 'Understand'
    }

    const COLORS = ['#7C3AED', '#2DD4BF']
    const existing = state.participants.get(userId)
    const color = existing?.color || COLORS[Math.min(state.participants.size, COLORS.length - 1)]

    // Track participant in memory (and Supabase best-effort).
    if (!existing) {
      state.participants.set(userId, { userId, userName: userName || 'Anonymous', color })
    }

    const numericSessionId = state.session.sessionId != null && String(state.session.sessionId).match(/^\d+$/)
      ? state.session.sessionId
      : null

    if (supabaseAdmin && numericSessionId && userId) {
      await supabaseAdmin.from('participants').insert({
        session_id: numericSessionId,
        user_name: userName || 'Anonymous',
        user_id: userId,
        color,
      })
    }

    return res.json({ sessionId: state.session.sessionId })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to start session' })
  }
})

router.post('/:code/sessions/:sessionId/snapshots', async (req, res) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase()
    const sessionId = req.params.sessionId
    if (!code || !sessionId) return res.status(400).json({ error: 'code + sessionId required' })

    const { code: snapshotCode } = req.body || {}
    const state = ensureRoom(code)
    if (!state.snapshots) state.snapshots = []
    const entry = { takenAt: Date.now(), code: snapshotCode || '' }
    state.snapshots.push(entry)

    if (!sessionSnapshots.has(sessionId)) sessionSnapshots.set(sessionId, [])
    sessionSnapshots.get(sessionId).push(entry)

    const numericSessionId = sessionId != null && String(sessionId).match(/^\d+$/) ? sessionId : null
    if (supabaseAdmin && numericSessionId) {
      await supabaseAdmin.from('code_snapshots').insert({
        session_id: numericSessionId,
        code: snapshotCode || '',
      })
    }

    return res.json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to save snapshot' })
  }
})

export default router

