import express from 'express'
import { supabaseAdmin } from '../db/supabase.js'
import { sessionSnapshots } from '../state.js'

const router = express.Router()

router.get('/:sessionId/snapshots', async (req, res) => {
  try {
    const sessionId = req.params.sessionId
    const inMemory = sessionSnapshots.get(sessionId)
    if (inMemory?.length) {
      return res.json({
        snapshots: inMemory.map((s) => ({ code: s.code, taken_at: new Date(s.takenAt).toISOString() })),
      })
    }

    if (!supabaseAdmin) return res.json({ snapshots: [] })
    const numericId = String(sessionId).match(/^\d+$/) ? sessionId : null
    if (!numericId) return res.json({ snapshots: [] })

    const { data, error } = await supabaseAdmin
      .from('code_snapshots')
      .select('code, taken_at')
      .eq('session_id', numericId)
      .order('taken_at', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })
    return res.json({ snapshots: data || [] })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to load snapshots' })
  }
})

router.get('/:sessionId/evaluation', async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(404).json({ error: 'Supabase not configured' })
    const sessionId = req.params.sessionId

    const { data, error } = await supabaseAdmin
      .from('evaluations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return res.status(500).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Evaluation not found' })

    const scoresJson = data.scores_json || {}
    return res.json({
      overall_score: data.overall_score,
      candidate_scores: scoresJson.candidate_scores || scoresJson,
      strengths: scoresJson.strengths || [],
      areas_for_improvement: scoresJson.areas_for_improvement || [],
      recommended_next_problems: scoresJson.recommended_next_problems || [],
      session_summary: data.summary || scoresJson.session_summary || '',
    })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to load evaluation' })
  }
})

export default router

