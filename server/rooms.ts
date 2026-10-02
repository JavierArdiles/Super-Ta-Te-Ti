import { randomUUID } from 'node:crypto'
import { DEFAULT_APPEARANCES, makeDistinct, type Appearances } from '../src/components/appearance'
import { PLAYERS_BY_COUNT, applyMove, createInitialState, isGameOver, type GameState, type Move, type Player, type PlayerCount } from '../src/game/logic'
import { ROOM_CODE_LENGTH, type OnlinePlayer, type OnlineStarter, type PlayerProfile, type RoomSnapshot, type RoomStatus } from '../src/online/protocol'

// Sin letras que se confunden entre sí (I/1, O/0)
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const EMPTY_ROOM_TTL_MS = 10 * 60 * 1000

interface Seat extends OnlinePlayer {
  token: string
}

export interface Room {
  code: string
  playerCount: PlayerCount
  starter: OnlineStarter
  players: Seat[]
  state: GameState | null
  lastStarter: Player | null
  /** Desde cuándo no hay nadie conectado */
  emptySince: number | null
}

export type Result<T> = T | { error: string }

export function isError<T>(result: Result<T>): result is { error: string } {
  return typeof result === 'object' && result !== null && 'error' in result
}

function statusOf(room: Room): RoomStatus {
  if (!room.state) return 'waiting'
  return isGameOver(room.state) ? 'finished' : 'playing'
}

export function snapshot(room: Room): RoomSnapshot {
  return {
    code: room.code,
    playerCount: room.playerCount,
    status: statusOf(room),
    players: room.players.map(({ token: _token, ...player }) => player),
    state: room.state,
  }
}

export class RoomManager {
  readonly rooms = new Map<string, Room>()
  private readonly random: () => number

  constructor(random: () => number = Math.random) {
    this.random = random
  }

  private newCode(): string {
    for (;;) {
      let code = ''
      for (let i = 0; i < ROOM_CODE_LENGTH; i++) code += CODE_ALPHABET[Math.floor(this.random() * CODE_ALPHABET.length)]
      if (!this.rooms.has(code)) return code
    }
  }

  /** Le asigna al jugador una ficha que no repita las de los que ya están */
  private seatPlayer(room: Room, profile: PlayerProfile): Seat {
    const seats = PLAYERS_BY_COUNT[room.playerCount]
    const seat = seats.find(s => !room.players.some(p => p.seat === s))!
    const appearances: Appearances = { ...DEFAULT_APPEARANCES }
    for (const p of room.players) appearances[p.seat] = p.appearance
    appearances[seat] = profile.appearance
    const order = [...room.players.map(p => p.seat), seat]
    const name = profile.name.trim() || `Jugador ${seats.indexOf(seat) + 1}`
    const player: Seat = { seat, name, appearance: makeDistinct(appearances, order)[seat], connected: true, token: randomUUID() }
    room.players.push(player)
    return player
  }

  private startGame(room: Room) {
    const seats = PLAYERS_BY_COUNT[room.playerCount]
    let first: Player
    if (room.lastStarter) first = seats[(seats.indexOf(room.lastStarter) + 1) % seats.length]
    else if (room.starter === 'random') first = seats[Math.floor(this.random() * seats.length)]
    else first = seats[0]
    room.lastStarter = first
    room.state = createInitialState(room.playerCount, first)
  }

  private find(code: string, token: string): Result<{ room: Room; player: Seat }> {
    const room = this.rooms.get(code)
    const player = room?.players.find(p => p.token === token)
    if (!room || !player) return { error: 'No estás en esa sala.' }
    return { room, player }
  }

  create(playerCount: PlayerCount, starter: OnlineStarter, profile: PlayerProfile) {
    const room: Room = { code: this.newCode(), playerCount, starter, players: [], state: null, lastStarter: null, emptySince: null }
    this.rooms.set(room.code, room)
    const player = this.seatPlayer(room, profile)
    return { room, player }
  }

  peek(code: string): Result<Room> {
    return this.rooms.get(code) ?? { error: 'Esa sala no existe o ya terminó.' }
  }

  join(code: string, profile: PlayerProfile): Result<{ room: Room; player: Seat }> {
    const room = this.rooms.get(code)
    if (!room) return { error: 'Esa sala no existe o ya terminó.' }
    if (room.players.length >= room.playerCount) return { error: 'La sala ya está completa.' }
    const player = this.seatPlayer(room, profile)
    room.emptySince = null
    if (room.players.length === room.playerCount) this.startGame(room)
    return { room, player }
  }

  rejoin(code: string, token: string): Result<{ room: Room; player: Seat }> {
    const found = this.find(code, token)
    if (isError(found)) return found
    this.setConnected(found.room, found.player, true)
    return found
  }

  move(code: string, token: string, move: Move): Result<Room> {
    const found = this.find(code, token)
    if (isError(found)) return found
    const { room, player } = found
    if (!room.state || isGameOver(room.state)) return { error: 'La partida no está en juego.' }
    if (room.state.currentPlayer !== player.seat) return { error: 'No es tu turno.' }
    const next = applyMove(room.state, move.boardIndex, move.cellIndex).state
    if (next === room.state) return { error: 'Esa jugada no es válida.' }
    room.state = next
    return room
  }

  rematch(code: string, token: string): Result<Room> {
    const found = this.find(code, token)
    if (isError(found)) return found
    const { room } = found
    if (statusOf(room) !== 'finished') return { error: 'La partida todavía no terminó.' }
    this.startGame(room)
    return room
  }

  /** En la sala de espera libera el lugar; con la partida empezada lo deja reservado */
  leave(code: string, token: string): Result<Room> {
    const found = this.find(code, token)
    if (isError(found)) return found
    const { room, player } = found
    if (statusOf(room) === 'waiting') room.players = room.players.filter(p => p !== player)
    else this.setConnected(room, player, false)
    if (room.players.length === 0) this.rooms.delete(room.code)
    return room
  }

  setConnected(room: Room, player: Seat, connected: boolean, now = Date.now()) {
    player.connected = connected
    room.emptySince = room.players.some(p => p.connected) ? null : (room.emptySince ?? now)
  }

  /** Borra las salas que quedaron sin nadie conectado por un rato */
  cleanup(now = Date.now()) {
    for (const [code, room] of this.rooms) {
      if (room.emptySince !== null && now - room.emptySince > EMPTY_ROOM_TTL_MS) this.rooms.delete(code)
    }
  }
}
