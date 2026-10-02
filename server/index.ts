import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { WebSocket, WebSocketServer } from 'ws'
import type { ServerMessage } from '../src/online/protocol'
import { RoomManager, isError, snapshot, type Room } from './rooms'
import { parseClientMessage } from './validate'

const PORT = Number(process.env.PORT ?? 3000)
const DIST = resolve(import.meta.dirname, '../dist')

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
}

// Sirve el juego compilado; cualquier ruta desconocida devuelve index.html
const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const requested = normalize(join(DIST, decodeURIComponent(url.pathname)))
  const insideDist = requested.startsWith(DIST)
  const file = insideDist && existsSync(requested) && statSync(requested).isFile() ? requested : join(DIST, 'index.html')
  if (!existsSync(file)) {
    res.writeHead(503, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Falta compilar el juego: corré "npm run online".')
    return
  }
  res.writeHead(200, { 'content-type': CONTENT_TYPES[extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
})

const rooms = new RoomManager()
const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 4 * 1024 })

/** A qué sala y con qué token está cada conexión */
const sessions = new Map<WebSocket, { code: string; token: string }>()

function send(ws: WebSocket, message: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message))
}

function broadcast(room: Room) {
  const message: ServerMessage = { type: 'room', room: snapshot(room) }
  for (const [ws, session] of sessions) if (session.code === room.code) send(ws, message)
}

wss.on('connection', ws => {
  ws.on('message', raw => {
    const message = parseClientMessage(raw.toString())
    if (!message) return send(ws, { type: 'error', message: 'Mensaje inválido.' })
    const session = sessions.get(ws)

    switch (message.type) {
      case 'create': {
        const { room, player } = rooms.create(message.playerCount, message.starter, message.player)
        sessions.set(ws, { code: room.code, token: player.token })
        send(ws, { type: 'welcome', code: room.code, seat: player.seat, token: player.token })
        return broadcast(room)
      }
      case 'peek': {
        const room = rooms.peek(message.code)
        if (isError(room)) return send(ws, { type: 'error', message: room.error, fatal: true })
        return send(ws, { type: 'room', room: snapshot(room) })
      }
      case 'join':
      case 'rejoin': {
        const result = message.type === 'join' ? rooms.join(message.code, message.player) : rooms.rejoin(message.code, message.token)
        if (isError(result)) return send(ws, { type: 'error', message: result.error, fatal: message.type === 'rejoin' })
        sessions.set(ws, { code: result.room.code, token: result.player.token })
        send(ws, { type: 'welcome', code: result.room.code, seat: result.player.seat, token: result.player.token })
        return broadcast(result.room)
      }
      case 'move':
      case 'rematch':
      case 'leave': {
        if (!session) return send(ws, { type: 'error', message: 'Primero entrá a una sala.' })
        const result =
          message.type === 'move'
            ? rooms.move(session.code, session.token, message)
            : message.type === 'rematch'
              ? rooms.rematch(session.code, session.token)
              : rooms.leave(session.code, session.token)
        if (isError(result)) return send(ws, { type: 'error', message: result.error })
        if (message.type === 'leave') sessions.delete(ws)
        return broadcast(result)
      }
    }
  })

  ws.on('close', () => {
    const session = sessions.get(ws)
    sessions.delete(ws)
    if (!session) return
    const room = rooms.rooms.get(session.code)
    const player = room?.players.find(p => p.token === session.token)
    // Si el mismo jugador ya volvió desde otra conexión, no lo marcamos desconectado
    const stillConnected = [...sessions.values()].some(s => s.token === session.token)
    if (room && player && !stillConnected) {
      rooms.setConnected(room, player, false)
      broadcast(room)
    }
  })
})

setInterval(() => rooms.cleanup(), 60 * 1000).unref()

server.listen(PORT, () => {
  console.log(`Super Ta-Te-Ti online en http://localhost:${PORT}`)
  console.log(`Para compartirlo: cloudflared tunnel --url http://localhost:${PORT}`)
})
