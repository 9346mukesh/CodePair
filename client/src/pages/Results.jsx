import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import html2canvas from 'html2canvas'
import ReplayTimeline from '../components/ReplayTimeline'
import ScoreCard from '../components/ScoreCard'
import { api } from '../lib/api'
import { PROBLEMS } from '../lib/problems'

function Gauge({ score }) {
  const r = 54
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, score / 100))
  const dash = c * pct
  const color = score >= 80 ? '#238636' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} stroke="#30363D" strokeWidth="10" fill="none" />
      <circle
        cx="70"
        cy="70"
        r={r}
        stroke={color}
        strokeWidth="10"
        fill="none"
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
      />
      <text
        x="70"
        y="74"
        textAnchor="middle"
        fontSize="22"
        fill="#E6EDF3"
        fontFamily="Inter, system-ui"
        fontWeight="700"
      >
        {score}
      </text>
      <text x="70" y="94" textAnchor="middle" fontSize="10" fill="#8B949E">
        overall
      </text>
    </svg>
  )
}

export default function Results() {
  const { sessionId } = useParams()
  const loc = useLocation()
  const nav = useNavigate()
  const shareCardRef = useRef(null)
  const [shareStatus, setShareStatus] = useState('')
  const [showReplay, setShowReplay] = useState(false)

  const mock = {
    overall_score: 82,
    candidate_scores: {
      Creator: { problem_solving: 21, communication: 20, code_quality: 18, time_complexity_awareness: 19 },
      Partner: { problem_solving: 19, communication: 18, code_quality: 17, time_complexity_awareness: 16 },
    },
    strengths: ['Clear approach discussion', 'Good test coverage mindset'],
    areas_for_improvement: ['Earlier complexity analysis', 'More edge cases'],
    recommended_next_problems: ['Longest Substring Without Repeating Characters', 'Valid Parentheses', 'Binary Tree Level Order Traversal'],
    session_summary:
      'You collaborated effectively and converged on an optimal approach after brief exploration. Communication was solid; aim to articulate complexity trade-offs earlier.',
  }

  const passedEvaluation = loc.state?.evaluation || null
  const [evaluation, setEvaluation] = useState(passedEvaluation)

  useEffect(() => {
    if (passedEvaluation) return
    if (!sessionId) return
    let cancelled = false
    api
      .get(`/api/sessions/${sessionId}/evaluation`)
      .then((res) => {
        if (cancelled) return
        setEvaluation(res.data)
      })
      .catch(() => {
        // keep mock fallback
      })
    return () => {
      cancelled = true
    }
  }, [passedEvaluation, sessionId])

  const view = useMemo(() => evaluation || mock, [evaluation, mock])

  const totalTime = loc.state?.totalTime || '00:45:00'

  const handleShare = async () => {
    if (!shareCardRef.current) return
    setShareStatus('Capturing…')
    try {
      const canvas = await html2canvas(shareCardRef.current, { backgroundColor: '#0D1117', scale: 2 })
      canvas.toBlob((blob) => {
        if (!blob) return
        const item = new ClipboardItem({ 'image/png': blob })
        navigator.clipboard.write([item]).then(() => {
          setShareStatus('Copied to clipboard!')
          setTimeout(() => setShareStatus(''), 2000)
        }).catch(() => setShareStatus('Share failed'))
      })
    } catch {
      setShareStatus('Share failed')
    }
  }

  const handlePracticeAgain = async () => {
    try {
      const res = await api.post('/api/rooms/create', {
        userName: loc.state?.userName || 'Anonymous',
        difficulty: 'Medium',
        language: 'Python',
        type: 'Mixed',
      })
      nav(`/lobby/${res.data?.code}`, {
        state: { userName: loc.state?.userName, isCreator: true, userId: loc.state?.userId },
      })
    } catch {
      nav('/', { state: { openCreateModal: true } })
    }
  }

  const handlePracticeProblem = async (problemName) => {
    const p = PROBLEMS.find((x) => x.title === problemName) || PROBLEMS[0]
    try {
      const res = await api.post('/api/rooms/create', {
        userName: loc.state?.userName || 'Anonymous',
        difficulty: p.difficulty,
        language: 'Python',
        type: 'Mixed',
        problemId: p.id,
      })
      nav(`/lobby/${res.data?.code}`, {
        state: { userName: loc.state?.userName, isCreator: true, problemId: p.id, room: { problemId: p.id, difficulty: p.difficulty } },
      })
    } catch {
      nav('/library')
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div ref={shareCardRef} className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-8">
        <div className="text-2xl font-semibold text-text-primary">Session Complete</div>
        <div className="mt-2 text-xs text-text-secondary">
          Session: <span className="mono text-text-primary">{loc.state?.sessionId || sessionId}</span> ·{' '}
          {new Date().toLocaleString()} · Total {totalTime}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-6 lg:col-span-1">
          <div className="text-sm font-semibold text-text-primary">Overall score</div>
          <div className="mt-4 flex justify-center">
            <Gauge score={view.overall_score} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:col-span-2 lg:grid-cols-2">
          {Object.entries(view.candidate_scores).map(([name, scores]) => (
            <ScoreCard key={name} name={name} scores={scores} />
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="text-sm font-semibold text-text-primary">AI Summary</div>
          <div className="mt-3 rounded-lg border border-border bg-[#0f141b] p-4 text-sm text-text-secondary">
            {view.session_summary}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="text-sm font-semibold text-text-primary">Highlights</div>
          <div className="mt-3 grid grid-cols-1 gap-4">
            <div className="rounded-lg border border-border bg-[#0f141b] p-4">
              <div className="mb-2 text-xs font-semibold text-success">Strengths</div>
                <ul className="list-disc space-y-1 pl-4 text-xs text-text-secondary">
                  {view.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-[#0f141b] p-4">
              <div className="mb-2 text-xs font-semibold text-amber-400">Areas for improvement</div>
              <ul className="list-disc space-y-1 pl-4 text-xs text-text-secondary">
                {view.areas_for_improvement.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-6">
        <div className="mb-4 text-sm font-semibold text-text-primary">Recommended next problems</div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {view.recommended_next_problems.slice(0, 3).map((p) => (
            <div key={p} className="rounded-lg border border-border bg-[#0f141b] p-4">
              <div className="text-sm font-semibold text-text-primary">{p}</div>
              <div className="mt-2 flex gap-2">
                <span className="rounded-md border border-border bg-[#0b0f14] px-2 py-1 text-[11px] text-text-secondary">
                  Medium
                </span>
                <span className="rounded-md border border-border bg-[#0b0f14] px-2 py-1 text-[11px] text-text-secondary">
                  Mixed
                </span>
              </div>
              <button
                type="button"
                onClick={() => handlePracticeProblem(p)}
                className="mt-4 w-full rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                Practice this
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-secondary hover:text-text-primary"
          >
            {shareStatus || 'Share Results'}
          </button>
          <button
            type="button"
            onClick={handlePracticeAgain}
            className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            Practice Again
          </button>
          <button
            type="button"
            onClick={() => setShowReplay((v) => !v)}
            className="rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-secondary hover:text-text-primary"
          >
            {showReplay ? 'Hide' : 'View'} Session Replay
          </button>
        </div>
      </div>
      </div>

      {showReplay ? (
        <div className="mt-6">
          <ReplayTimeline sessionId={sessionId} />
        </div>
      ) : null}
    </div>
  )
}

