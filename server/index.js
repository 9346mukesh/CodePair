import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

import roomsRouter from './routes/rooms.js'
import aiRouter from './routes/ai.js'
import executeRouter from './routes/execute.js'
import sessionsRouter from './routes/sessions.js'
import { registerSocketHandlers } from './socket/handlers.js'

const app = express()
app.use(express.json({ limit: '5mb' }))

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
app.use(
  cors({
    origin: clientUrl,
    methods: ['GET', 'POST'],
  }),
)

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/api/rooms', roomsRouter)
app.use('/api/ai', aiRouter)
app.use('/api/execute', executeRouter)
app.use('/api/sessions', sessionsRouter)

const server = http.createServer(app)

const io = new Server(server, {
  cors: { origin: clientUrl, methods: ['GET', 'POST'] },
})

registerSocketHandlers(io)

const port = Number(process.env.PORT || 3001)
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[CodePair] server listening on :${port}`)
})

