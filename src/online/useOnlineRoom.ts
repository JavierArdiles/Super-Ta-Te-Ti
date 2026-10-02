import { useCallback, useEffect, useRef, useState } from 'react'
import type { Move, Player, PlayerCount } from '../game/logic'
import type { ClientMessage, OnlineStarter, PlayerProfile, RoomSnapshot, ServerMessage } from './protocol'

export type OnlineIntent = { kind: 'create'; playerCount: PlayerCount; starter: OnlineStarter; player: PlayerProfile } | { kind: 'join'; code: string }

const SESSION_KEY = 'super-ta-te-ti:online'
const RECONNECT_MS = 1500

interface Session {
  code: string
  token: string
}

function loadSession(): Session | null {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null')
  } catch {
    return null
  }
}

function saveSession(session: Session | null) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Sin sessionStorage no se puede recuperar el asiento al recargar, pero se juega igual
  }
}

function setRoomInUrl(code: string | null) {
  const url = new URL(window.location.href)
  if (code) url.searchParams.set('sala', code)
  else url.searchParams.delete('sala')
  window.history.replaceState(null, '', url)
}

/** Conexión con el servidor de partidas: entra a la sala, reconecta sola y recupera el asiento */
export function useOnlineRoom(intent: OnlineIntent) {
  const [room, setRoom] = useState<RoomSnapshot | null>(null)
  const [seat, setSeat] = useState<Player | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<{ message: string; fatal: boolean } | null>(null)
  const ws = useRef<WebSocket | null>(null)
  const code = useRef<string | null>(intent.kind === 'join' ? intent.code : null)
  const created = useRef(false)
  // La intención inicial no cambia durante la vida del hook
  const initialIntent = useRef(intent)

  const send = useCallback((message: ClientMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify(message))
  }, [])

  useEffect(() => {
    let closedByUs = false
    let retry: ReturnType<typeof setTimeout> | undefined

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const socket = new WebSocket(`${protocol}://${window.location.host}/ws`)
      ws.current = socket

      socket.onopen = () => {
        setConnected(true)
        const session = loadSession()
        const start = initialIntent.current
        if (session && (!code.current || session.code === code.current)) {
          socket.send(JSON.stringify({ type: 'rejoin', code: session.code, token: session.token }))
        } else if (start.kind === 'create' && !created.current) {
          created.current = true
          const { playerCount, starter, player } = start
          socket.send(JSON.stringify({ type: 'create', playerCount, starter, player }))
        } else if (code.current) {
          socket.send(JSON.stringify({ type: 'peek', code: code.current }))
        }
      }

      socket.onmessage = event => {
        const message = JSON.parse(event.data) as ServerMessage
        if (message.type === 'welcome') {
          code.current = message.code
          saveSession({ code: message.code, token: message.token })
          setRoomInUrl(message.code)
          setSeat(message.seat)
          setError(null)
        } else if (message.type === 'room') {
          setRoom(message.room)
        } else {
          // Si no pudimos volver a la sala (por ejemplo, se reinició el servidor), olvidamos el asiento
          if (message.fatal) saveSession(null)
          setError({ message: message.message, fatal: !!message.fatal })
        }
      }

      socket.onclose = () => {
        setConnected(false)
        if (!closedByUs) retry = setTimeout(connect, RECONNECT_MS)
      }
    }

    connect()
    return () => {
      closedByUs = true
      clearTimeout(retry)
      ws.current?.close()
    }
  }, [])

  const join = useCallback((player: PlayerProfile) => code.current && send({ type: 'join', code: code.current, player }), [send])
  const move = useCallback((m: Move) => send({ type: 'move', ...m }), [send])
  const rematch = useCallback(() => send({ type: 'rematch' }), [send])
  const leave = useCallback(() => {
    send({ type: 'leave' })
    saveSession(null)
    setRoomInUrl(null)
  }, [send])
  const clearError = useCallback(() => setError(null), [])

  return { room, seat, connected, error, join, move, rematch, leave, clearError }
}
