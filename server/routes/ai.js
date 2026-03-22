import express from 'express'
import { ensureRoom } from '../state.js'
import { openRouterChat, SYSTEM_PROMPT } from '../lib/openrouter.js'
import { supabaseAdmin } from '../db/supabase.js'

const router = express.Router()

router.post('/message', async (req, res) => {
  try {
    const { roomCode, userId, userName, sessionId, message } = req.body || {}
    if (!roomCode) return res.status(400).json({ error: 'roomCode is required' })
    if (!message) return res.status(400).json({ error: 'message is required' })

    const state = ensureRoom(String(roomCode).toUpperCase())
    state.history.push({ role: 'user', content: message, ts: Date.now(), userId, userName })

    const numericSessionId = sessionId != null && String(sessionId).match(/^\d+$/) ? sessionId : null
    if (supabaseAdmin && numericSessionId) {
      await supabaseAdmin.from('messages').insert({
        session_id: numericSessionId,
        sender: userId,
        content: message,
      })
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...state.history.slice(-40).map((m) =>
        m.role === 'user'
          ? { role: 'user', content: `${m.userName || 'Candidate'}: ${m.content}` }
          : { role: 'assistant', content: m.content },
      ),
    ]

    const content = await openRouterChat(messages)
    state.history.push({ role: 'assistant', content, ts: Date.now() })

    if (supabaseAdmin && numericSessionId) {
      await supabaseAdmin.from('messages').insert({
        session_id: numericSessionId,
        sender: 'ai',
        content,
      })
    }

    return res.json({ content })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'AI request failed' })
  }
})

router.post('/notes', async (req, res) => {
  try {
    const { roomCode } = req.body || {}
    if (!roomCode) return res.status(400).json({ error: 'roomCode is required' })

    const state = ensureRoom(String(roomCode).toUpperCase())
    const prompt = `In 1-2 sentences, write running interviewer notes about both candidates' progress. Be concrete, neutral, and brief.`

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...state.history.slice(-30).map((m) =>
        m.role === 'user'
          ? { role: 'user', content: `${m.userName || 'Candidate'}: ${m.content}` }
          : { role: 'assistant', content: m.content },
      ),
      { role: 'user', content: prompt },
    ]

    const content = await openRouterChat(messages)
    return res.json({ content })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'AI notes request failed' })
  }
})

router.post('/evaluate', async (req, res) => {
  try {
    const { roomCode, sessionId, candidates, finalCode, language } = req.body || {}
    if (!roomCode) return res.status(400).json({ error: 'roomCode is required' })

    const state = ensureRoom(String(roomCode).toUpperCase())
    const who = Array.isArray(candidates) && candidates.length ? candidates.join(', ') : 'the candidates'
    const prompt = `Evaluate the full session for ${who}. Return ONLY valid JSON matching the required schema. Include numeric scores. Use concise strengths and improvement bullets.`

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...state.history.slice(-80).map((m) =>
        m.role === 'user'
          ? { role: 'user', content: `${m.userName || 'Candidate'}: ${m.content}` }
          : { role: 'assistant', content: m.content },
      ),
      {
        role: 'user',
        content: `Final code (${language || 'unknown'}):\n\n${finalCode || ''}\n\n${prompt}`,
      },
    ]

    const content = await openRouterChat(messages, { temperature: 0.4, max_tokens: 700 })

    // best-effort JSON parse
    let json = null
    try {
      json = JSON.parse(content)
    } catch {
      // if model wrapped JSON in text, attempt to extract
      const start = content.indexOf('{')
      const end = content.lastIndexOf('}')
      if (start >= 0 && end > start) {
        json = JSON.parse(content.slice(start, end + 1))
      }
    }

    if (!json) return res.status(500).json({ error: 'AI did not return valid JSON', raw: content })

    const numericSessionId = sessionId != null && String(sessionId).match(/^\d+$/) ? sessionId : null
    if (supabaseAdmin && numericSessionId) {
      await supabaseAdmin.from('evaluations').insert({
        session_id: numericSessionId,
        overall_score: json.overall_score,
        scores_json: json,
        summary: json.session_summary ?? '',
      })
    }

    return res.json(json)
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'AI evaluation failed' })
  }
})

export default router

