# CodePair

AI-powered collaborative coding interview practice for two candidates in a shared room: **real-time Monaco editor**, **pair chat**, **AI interviewer**, and **Judge0 execution**.



## Architecture

```
           ┌─────────────────────────┐
           │        Frontend         │
           │ React 18 + Vite + TW    │
           │ Monaco + socket.io      │
           └───────────┬─────────────┘
                       │ HTTPS (REST)
                       │ WS (Socket.io)
           ┌───────────▼─────────────┐
           │         Backend         │
           │ Node.js + Express       │
           │ Socket.io + routes      │
           └───────┬─────────┬───────┘
                   │         │
         OpenRouter│         │Judge0 (RapidAPI)
        (gpt-4o-mini)        │
                   │         │
               ┌───▼───┐  ┌──▼──────┐
               │  AI   │  │ Execute │
               └───────┘  └─────────┘
                   │
                   │ (persist)
               ┌───▼─────────────┐
               │    Supabase     │
               │ Auth + Postgres │
               └─────────────────┘
```

## Features

- [x] Landing page: create/join room CTAs + preview mock
- [x] Lobby: room code, copy/share, partner join signal
- [x] Session layout: 3-panel interview room (problem/chat/editor/output/participants/notes)
- [x] Monaco editor: real-time sync + remote cursor indicator (basic)
- [x] AI interviewer: server-side proxy to OpenRouter (keeps key off client)
- [x] Code execution: server proxy to Judge0 RapidAPI with polling
- [x] Results page: score gauge + per-participant breakdown (mock data placeholder)
- [x] Problems Library: 20 preloaded cards (UI)
- [x] Supabase persistence: rooms/sessions/messages/evals/snapshots (schema + best-effort wiring)
- [x] Session replay timeline + html2canvas share card

## Tech stack

| Layer | Tech |
|------:|------|
| Frontend | React 18, Vite, Tailwind CSS, Monaco Editor, socket.io-client |
| Backend | Node.js, Express, Socket.io |
| AI | OpenRouter API (`gpt-4o-mini`) |
| Execution | Judge0 CE via RapidAPI |
| Auth/DB | Supabase Auth + Postgres |

## Local setup

### 1) Install

```bash
npm install --prefix client
npm install --prefix server
```

### 2) Environment variables

- **Server**: copy `server/.env.example` → `server/.env`
- **Client**: copy `client/.env.example` → `client/.env`

### 3) Run dev

```bash
# Terminal A
npm run dev:server

# Terminal B
npm run dev:client
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3001`

## Socket.io event reference

| Direction | Event | Payload |
|---|---|---|
| C → S | `join_room` | `{ roomCode, userName, userId }` |
| C → S | `code_change` | `{ roomCode, delta, fullCode, cursorPosition }` |
| C → S | `cursor_move` | `{ roomCode, userId, position }` |
| C → S | `chat_message` | `{ roomCode, userId, message }` |
| C → S | `phase_change` | `{ roomCode, newPhase }` |
| C → S | `timer_update` (creator only) | `{ roomCode, elapsed, phase, phaseElapsed, phaseTimeLimit }` |
| C → S | `end_session` | `{ roomCode }` |
| S → C | `partner_joined` | `{ userName, userId, color }` |
| S → C | `partner_left` | `{ userId }` |
| S → C | `code_update` | `{ delta, fullCode, userId }` |
| S → C | `cursor_update` | `{ userId, position, color }` |
| S → C | `ai_message` | `{ content, type }` |
| S → C | `timer_update` | `{ elapsed, phase, phaseElapsed, phaseTimeLimit }` |
| S → C | `session_ended` | `{ trigger, redirect }` |

## Supabase schema setup

1. Create a Supabase project.
2. Open **SQL Editor** and run:
   - `server/db/schema.sql`
3. Put these values in `server/.env`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
4. Put these values in `client/.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

Note: `rooms` includes `problem_id` so the assigned problem is consistent for both candidates after reload.


## Screenshots

- Landing:
![alt text](<Screenshots/Screenshot 2026-03-22 at 12.27.03 PM.png>)
- Lobby:
![alt text](<Screenshots/Screenshot 2026-03-22 at 12.27.33 PM.png>)
- Session:
![alt text](<Screenshots/Screenshot 2026-03-22 at 12.30.57 PM.png>)
- Results:
![alt text](<Screenshots/Screenshot 2026-03-22 at 12.31.51 PM.png>)

