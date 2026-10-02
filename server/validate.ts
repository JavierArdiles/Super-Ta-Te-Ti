import { isValidAppearance } from '../src/components/appearance'
import { MAX_NAME_LENGTH, ROOM_CODE_LENGTH, type ClientMessage, type PlayerProfile } from '../src/online/protocol'

function isIndex(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 8
}

function isCode(value: unknown): value is string {
  return typeof value === 'string' && value.length === ROOM_CODE_LENGTH && /^[A-Z0-9]+$/.test(value)
}

function profile(value: unknown): PlayerProfile | null {
  const p = value as PlayerProfile
  if (!p || typeof p.name !== 'string' || !isValidAppearance(p.appearance)) return null
  return { name: p.name.trim().slice(0, MAX_NAME_LENGTH), appearance: { symbol: p.appearance.symbol, color: p.appearance.color } }
}

/** Convierte lo que manda el navegador en un mensaje confiable, o null si no tiene sentido */
export function parseClientMessage(raw: string): ClientMessage | null {
  let data: Record<string, unknown>
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  if (!data || typeof data !== 'object') return null

  switch (data.type) {
    case 'create': {
      const player = profile(data.player)
      const playerCount = data.playerCount
      const starter = data.starter
      if (!player || (playerCount !== 2 && playerCount !== 3) || (starter !== 'creator' && starter !== 'random')) return null
      return { type: 'create', playerCount, starter, player }
    }
    case 'peek':
      return isCode(data.code) ? { type: 'peek', code: data.code } : null
    case 'join': {
      const player = profile(data.player)
      return isCode(data.code) && player ? { type: 'join', code: data.code, player } : null
    }
    case 'rejoin':
      return isCode(data.code) && typeof data.token === 'string' && data.token.length <= 64
        ? { type: 'rejoin', code: data.code, token: data.token }
        : null
    case 'move':
      return isIndex(data.boardIndex) && isIndex(data.cellIndex)
        ? { type: 'move', boardIndex: data.boardIndex, cellIndex: data.cellIndex }
        : null
    case 'rematch':
    case 'leave':
      return { type: data.type }
    default:
      return null
  }
}
