import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import { api } from '../lib/api'

function getOrCreateUserId() {
  const k = 'codepair:userId'
  const existing = sessionStorage.getItem(k)
  if (existing) return existing
  const id = crypto.randomUUID()
  sessionStorage.setItem(k, id)
  return id
}

export default function Lobby() {
  const { roomCode } = useParams()
  const nav = useNavigate()
  const loc = useLocation()
  const [copied, setCopied] = useState(false)
  const [partner, setPartner] = useState(null)
  const [roomDetails, setRoomDetails] = useState(loc.state?.room ?? null)

  const userId = useMemo(() => getOrCreateUserId(), [])
  const userName = loc.state?.userName || 'Anonymous'
  const isCreator = !!loc.state?.isCreator

  const { socket, connected } = useSocket({ roomCode, userName, userId, isCreator })

  useEffect(() => {
    if (!socket) return
    const onPartnerJoined = (p) => setPartner(p)
    const onPartnerLeft = () => setPartner(null)
    socket.on('partner_joined', onPartnerJoined)
    socket.on('partner_left', onPartnerLeft)
    return () => {
      socket.off('partner_joined', onPartnerJoined)
      socket.off('partner_left', onPartnerLeft)
    }
  }, [socket])

  useEffect(() => {
    api
      .get(`/api/rooms/${String(roomCode).toUpperCase()}`)
      .then((res) => {
        const apiRoom = res.data?.room || {}
        setRoomDetails((prev) => ({ ...(prev || {}), ...apiRoom }))
      })
      .catch(() => {})
  }, [roomCode])

  const link = `codepair.dev/join/${roomCode}`

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <Link to="/" className="mono text-sm font-semibold text-text-primary">
          CodePair
        </Link>
        <div className="text-xs text-text-secondary">
          Socket: <span className="text-text-primary">{connected ? 'connected' : 'offline'}</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="text-sm font-semibold text-text-primary">Room Code</div>
          <div className="mt-3 flex items-center gap-3">
            <div className="mono rounded-lg border border-border bg-[#0b0f14] px-4 py-3 text-2xl tracking-widest text-text-primary">
              {roomCode}
            </div>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(roomCode)
                setCopied(true)
                setTimeout(() => setCopied(false), 900)
              }}
              className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(link)
                setCopied(true)
                setTimeout(() => setCopied(false), 900)
              }}
              className="rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-secondary hover:text-text-primary"
            >
              Share link
            </button>
            <div className="text-[11px] text-text-secondary self-center">{link}</div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="text-sm font-semibold text-text-primary">Lobby</div>
          <div className="mt-3 rounded-lg border border-border bg-[#0f141b] p-4">
            {partner ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-text-primary">Partner connected!</div>
                  <div className="mt-1 text-xs text-text-secondary">{partner.userName}</div>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-success" />
              </div>
            ) : (
              <div className="text-xs text-text-secondary">
                <div className="mb-2 font-semibold text-text-primary">Waiting for partner…</div>
                <div className="h-3 w-40 animate-pulse rounded bg-[#1f2630]" />
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() =>
                nav(`/session/${roomCode}`, {
                  state: { userName, userId, isCreator, partner, room: roomDetails },
                })
              }
              className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              Start Session
            </button>
            {isCreator ? (
              <button
                type="button"
                onClick={() =>
                  nav(`/session/${roomCode}`, {
                    state: { userName, userId, isCreator, solo: true, room: roomDetails },
                  })
                }
                className="rounded-md border border-border bg-[#0b0f14] px-3 py-2 text-xs text-text-secondary hover:text-text-primary"
              >
                Start without partner
              </button>
            ) : null}
          </div>
          <div className="mt-2 text-[11px] text-text-secondary">
            Tip: best experienced on desktop.
          </div>
        </div>
      </div>
    </div>
  )
}

