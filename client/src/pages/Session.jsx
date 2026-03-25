import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AIChat from '../components/AIChat'
import CodeEditor from '../components/CodeEditor'
import ErrorBoundary from '../components/ErrorBoundary'
import LanguageSelector from '../components/LanguageSelector'
import OutputPanel from '../components/OutputPanel'
import ParticipantPanel from '../components/ParticipantPanel'
import ProblemPanel from '../components/ProblemPanel'
import RunButton from '../components/RunButton'
import TimerBar from '../components/TimerBar'
import { PHASES } from '../components/timerPhases'
import { useAI } from '../hooks/useAI'
import { useRoom } from '../hooks/useRoom'
import { useSocket } from '../hooks/useSocket'
import { api } from '../lib/api'
import { pickProblem } from '../lib/problems'

const JUDGE0 = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
  go: 60,
  rust: 73,
  typescript: 74,
}

function getOrCreateUserId() {
  const k = 'codepair:userId'
  const existing = sessionStorage.getItem(k)
  if (existing) return existing
  const id = crypto.randomUUID()
  sessionStorage.setItem(k, id)
  return id
}

export default function Session() {
  const { roomCode } = useParams()
  const nav = useNavigate()
  const loc = useLocation()
  const isCreator = !!loc.state?.isCreator || !!loc.state?.solo
  const soloMode = !!loc.state?.solo

  const userId = loc.state?.userId || getOrCreateUserId()
  const userName = loc.state?.userName || 'Anonymous'
  const self = useMemo(
    () => ({ userId, userName, color: loc.state?.isCreator ? '#7C3AED' : '#2DD4BF' }),
    [loc.state?.isCreator, userId, userName],
  )

  const [language, setLanguage] = useState('javascript')
  const [running, setRunning] = useState(false)
  const [outputTab, setOutputTab] = useState('Output')
  const [result, setResult] = useState(null)
  const [chatCollapsed, setChatCollapsed] = useState(false)
  const [problemCollapsed, setProblemCollapsed] = useState(false)
  const [roomDetails, setRoomDetails] = useState(loc.state?.room || null)
  const [problemLoading, setProblemLoading] = useState(!loc.state?.room)

  const [elapsedMs, setElapsedMs] = useState(0)
  const [phase, setPhase] = useState(PHASES[0].key)
  const [phaseElapsedMs, setPhaseElapsedMs] = useState(0)
  const phaseIdxRef = useRef(0)
  const phaseElapsedRef = useRef(0)

  const localSessionId = useMemo(() => `local-${roomCode}-${Date.now()}`, [roomCode])
  const [serverSessionId, setServerSessionId] = useState(null)
  const activeSessionId = serverSessionId ?? localSessionId
  const assignedProblem = useMemo(
    () =>
      pickProblem({
        roomCode,
        difficulty: roomDetails?.difficulty,
        interviewType: roomDetails?.type,
        problemId: roomDetails?.problemId || loc.state?.problemId,
      }),
    [roomCode, roomDetails?.difficulty, roomDetails?.type, roomDetails?.problemId, loc.state?.problemId],
  )
  const aiInitRef = useRef(false)

  const { socket, connected } = useSocket({ roomCode, userName, userId, isCreator })
  const { sendMessage, messages, notes, loadingNotes, sending } = useAI({
    roomCode,
    sessionId: activeSessionId,
    userId,
    userName,
    socket,
  })

  const {
    participants,
    setParticipants,
    code,
    cursors,
    banner,
    partnerConnected,
    partnerDisconnectedAt,
    emitCodeChange,
    emitCursorMove,
  } = useRoom({ roomCode, socket, self })
  const cursorLabelsById = useMemo(() => {
    const map = {}
    for (const p of participants) {
      map[p.userId] = { userName: p.userName, color: p.color }
    }
    return map
  }, [participants])
  const codeRef = useRef(code)
  useEffect(() => {
    codeRef.current = code
  }, [code])
  const [reconnectSecondsLeft, setReconnectSecondsLeft] = useState(null)

  useEffect(() => {
    setParticipants((prev) => {
      if (prev.find((p) => p.userId === self.userId)) return prev
      return [...prev, self]
    })
  }, [self, setParticipants])

  useEffect(() => {
    if (roomDetails) return
    setProblemLoading(true)
    api
      .get(`/api/rooms/${String(roomCode).toUpperCase()}`)
      .then((res) => {
        setRoomDetails(res.data?.room || null)
      })
      .catch(() => {
        setRoomDetails(null)
      })
      .finally(() => setProblemLoading(false))
  }, [roomDetails, roomCode])

  useEffect(() => {
    if (!socket) return
    const onTimerUpdate = ({ elapsed, phase, phaseElapsed }) => {
      if (isCreator) return
      if (typeof elapsed === 'number') setElapsedMs(elapsed)
      if (phase) setPhase(phase)
      if (typeof phaseElapsed === 'number') setPhaseElapsedMs(phaseElapsed)
    }
    socket.on('timer_update', onTimerUpdate)
    return () => socket.off('timer_update', onTimerUpdate)
  }, [socket, isCreator])

  useEffect(() => {
    if (!isCreator) return
    if (aiInitRef.current) return
    if (problemLoading) return
    if (!assignedProblem) return
    aiInitRef.current = true

    const intro = `Session start. Assigned problem: ${assignedProblem.title} (${assignedProblem.difficulty}).\n\n${assignedProblem.description}\n\nWhat clarifying questions do you have?`
    sendMessage(intro)
  }, [assignedProblem, isCreator, problemLoading, sendMessage])

  useEffect(() => {
    // Create/retrieve a session id in Supabase (best-effort) for persistence.
    api
      .post(`/api/rooms/${String(roomCode).toUpperCase()}/start_session`, {
        userName,
        userId,
        solo: soloMode,
      })
      .then((res) => {
        if (res.data?.sessionId != null) setServerSessionId(res.data.sessionId)
      })
      .catch(() => {
        // Keep local session id fallback.
      })
  }, [roomCode, userId, userName, soloMode])

  useEffect(() => {
    if (!isCreator) return
    if (!activeSessionId) return

    const tick = async () => {
      try {
        await api.post(
          `/api/rooms/${String(roomCode).toUpperCase()}/sessions/${activeSessionId}/snapshots`,
          { code: codeRef.current },
        )
      } catch {
        // Best-effort snapshot saving
      }
    }

    // Snapshot immediately and then every 2 minutes.
    tick()
    const id = setInterval(tick, 120_000)
    return () => clearInterval(id)
  }, [isCreator, roomCode, activeSessionId])

  useEffect(() => {
    const startedAt = Date.now()
    const id = setInterval(() => {
      const e = Date.now() - startedAt
      setElapsedMs(e)
      phaseElapsedRef.current += 1000
      setPhaseElapsedMs(phaseElapsedRef.current)

      const p = PHASES[phaseIdxRef.current]
      const limit = p.minutes * 60_000

      if (isCreator && socket) {
        socket.emit('timer_update', {
          roomCode,
          elapsed: e,
          phase: p.key,
          phaseElapsed: phaseElapsedRef.current,
          phaseTimeLimit: limit,
        })
      }
      if (phaseElapsedRef.current >= limit) {
        const nextIdx = Math.min(PHASES.length - 1, phaseIdxRef.current + 1)
        if (nextIdx !== phaseIdxRef.current) {
          phaseIdxRef.current = nextIdx
          const nextPhaseKey = PHASES[nextIdx].key
          const nextPhaseTimeLimitMs = PHASES[nextIdx].minutes * 60_000
          setPhase(nextPhaseKey)
          phaseElapsedRef.current = 0
          setPhaseElapsedMs(0)
          if (isCreator) {
            socket?.emit('phase_change', {
              roomCode,
              newPhase: nextPhaseKey,
              elapsedMs: e,
              phaseElapsedMs: 0,
              phaseTimeLimitMs: nextPhaseTimeLimitMs,
            })
          }
        }
      }
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, socket])

  useEffect(() => {
    if (!partnerDisconnectedAt) return

    const deadline = partnerDisconnectedAt + 60_000
    setReconnectSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)))

    const tick = setInterval(() => {
      setReconnectSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)))
    }, 500)

    const t = setTimeout(() => {
      // End only if the partner is still not connected.
      if (!partnerConnected) {
        socket?.emit('end_session', { roomCode })
        nav(`/results/${activeSessionId}`, { state: { sessionId: activeSessionId, roomCode } })
      }
    }, Math.max(0, deadline - Date.now()))

    return () => {
      clearInterval(tick)
      clearTimeout(t)
    }
  }, [partnerDisconnectedAt, partnerConnected, nav, roomCode, activeSessionId, socket])

  const run = useCallback(async () => {
    setRunning(true)
    setResult(null)
    try {
      const testCases = assignedProblem?.testCases || []
      const hasTests = Array.isArray(testCases) && testCases.length > 0

      const payload = {
        code,
        language_id: JUDGE0[language] ?? 63,
      }

      if (hasTests) {
        payload.tests = testCases.map((t) => ({
          stdin: t.stdin,
          expectedOutput: t.expectedOutput,
        }))
      } else {
        payload.stdin = ''
      }

      const res = await api.post('/api/execute', payload)
      setResult(res.data)
    } catch (e) {
      setResult({ stdout: '', stderr: e?.response?.data?.error || 'Execution failed.', status: 'Error' })
    } finally {
      setRunning(false)
    }
  }, [assignedProblem, code, language])

  useEffect(() => {
    const onKeyDown = (e) => {
      const isCmd = e.metaKey || e.ctrlKey
      if (!isCmd) return

      if (e.key === 'Enter') {
        e.preventDefault()
        run()
      }
      if (e.key.toLowerCase() === 'h') {
        e.preventDefault()
        sendMessage('Request hint.')
      }
      if (e.key === '/') {
        e.preventDefault()
        setChatCollapsed((v) => !v)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [run, sendMessage])

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="mono text-xs text-text-secondary">
          Room <span className="text-text-primary">{roomCode}</span>
        </div>
        <div className="text-xs text-text-secondary">
          Connection: <span className="text-text-primary">{connected ? 'live' : 'offline'}</span>
        </div>
      </div>

      <div className="mb-3 hidden rounded-lg border border-border bg-[#0f141b] p-3 text-xs text-text-secondary max-[1024px]:block">
        Best experienced on desktop (≥ 1024px).
      </div>

      {banner ? (
        <div
          className={[
            'mb-3 rounded-lg border px-3 py-2 text-xs',
            banner.type === 'success'
              ? 'border-success bg-[#0f141b] text-text-primary'
              : 'border-amber-500 bg-[#0f141b] text-text-primary',
          ].join(' ')}
        >
          {partnerDisconnectedAt
            ? `Partner disconnected. Reconnecting in ${reconnectSecondsLeft ?? 60}s…`
            : banner.text}
        </div>
      ) : null}

      <div className="grid grid-cols-[280px_1fr_260px] gap-3 max-[1024px]:grid-cols-1">
        {/* LEFT */}
        <div className="flex flex-col gap-3">
          <ErrorBoundary>
            <ProblemPanel
              problem={assignedProblem}
              loading={problemLoading}
              collapsed={problemCollapsed}
              onToggle={() => setProblemCollapsed((v) => !v)}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <div className="h-[520px]">
              <AIChat
                messages={messages}
                onSend={sendMessage}
                sending={sending}
                collapsed={chatCollapsed}
                onToggle={() => setChatCollapsed((v) => !v)}
                showSkeleton={problemLoading || (loadingNotes && messages.length === 0)}
              />
            </div>
          </ErrorBoundary>
        </div>

        {/* CENTER */}
        <div className="flex min-h-[720px] flex-col gap-3">
          <ErrorBoundary>
            <TimerBar elapsedMs={elapsedMs} phase={phase} phaseElapsedMs={phaseElapsedMs} />
          </ErrorBoundary>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
            <LanguageSelector value={language} onChange={setLanguage} />
            <div className="flex items-center gap-2">
              <div className="text-[11px] text-text-secondary">
                Cmd+Enter: Run · Cmd+H: Hint · Cmd+/: Toggle chat
              </div>
              <RunButton onRun={run} running={running} />
            </div>
          </div>

          <ErrorBoundary>
            <div className="h-[520px]">
              <CodeEditor
                value={code}
                language={language === 'cpp' ? 'cpp' : language}
                cursors={cursors}
                selfUserId={self.userId}
                cursorLabelsById={cursorLabelsById}
                onChange={(next, cursorPosition) =>
                  emitCodeChange({ fullCode: next, cursorPosition })
                }
                onCursorMove={(pos) => emitCursorMove(pos)}
              />
            </div>
          </ErrorBoundary>

          <ErrorBoundary>
            <OutputPanel result={result} activeTab={outputTab} onTabChange={setOutputTab} />
          </ErrorBoundary>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-3">
          <ErrorBoundary>
            <ParticipantPanel participants={participants} />
          </ErrorBoundary>
          <ErrorBoundary>
            <div className="rounded-lg border border-border bg-surface p-3">
              <div className="mb-2 text-sm font-semibold text-text-primary">Live notes</div>
              <div className="rounded-md border border-border bg-[#0b0f14] p-3 text-xs text-text-secondary">
                {loadingNotes ? (
                  <div className="space-y-3">
                    <div className="h-3 w-5/6 animate-pulse rounded bg-[#1f2630]" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-[#1f2630]" />
                  </div>
                ) : (
                  notes || 'Notes will appear here as the AI observes.'
                )}
              </div>
            </div>
          </ErrorBoundary>
          <div className="mt-auto">
            <button
              type="button"
              onClick={async () => {
                const ok = window.confirm('End session and see results?')
                if (!ok) return
                socket?.emit('end_session', { roomCode })

                let evaluation = null
                let evaluationError = null
                const executionResult = result
                const executionSummary = executionResult
                  ? {
                      status: executionResult.status,
                      execution_time: executionResult.execution_time,
                      memory_used: executionResult.memory_used,
                      tests: Array.isArray(executionResult.tests)
                        ? executionResult.tests.map((t) => ({
                            status: t.status,
                            pass: t.pass,
                            execution_time: t.execution_time,
                            memory_used: t.memory_used,
                            // Keep the payload small; the AI doesn't need full stdout/stderr dumps.
                            stdout: typeof t.stdout === 'string' ? t.stdout.slice(0, 250) : '',
                            stderr: typeof t.stderr === 'string' ? t.stderr.slice(0, 250) : '',
                          }))
                        : [],
                    }
                  : null
                try {
                  const names = participants.map((p) => p.userName).filter(Boolean)
                  const res = await api.post('/api/ai/evaluate', {
                    roomCode,
                    candidates: names,
                    finalCode: code,
                    language,
                    sessionId: activeSessionId,
                    problemId: assignedProblem?.id,
                    problemTitle: assignedProblem?.title,
                    problemDifficulty: assignedProblem?.difficulty,
                    executionSummary,
                  })
                  evaluation = res.data
                } catch (e) {
                  evaluation = null
                  evaluationError =
                    e?.response?.data?.error ||
                    e?.response?.data?.raw ||
                    e?.message ||
                    'AI evaluation failed'
                }

                nav(`/results/${activeSessionId}`, {
                  state: { sessionId: activeSessionId, roomCode, evaluation, evaluationError, executionSummary },
                })
              }}
              className="w-full rounded-md border border-red-500/60 bg-[#0b0f14] px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10"
            >
              End Session
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

