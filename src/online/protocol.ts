import type { PlayerAppearance } from '../components/appearance'
import type { GameState, Move, Player, PlayerCount } from '../game/logic'

export type OnlineStarter = 'creator' | 'random'

export interface PlayerProfile {
  name: string
  appearance: PlayerAppearance
}

export interface OnlinePlayer extends PlayerProfile {
  seat: Player
  connected: boolean
}

export type RoomStatus = 'waiting' | 'playing' | 'finished'

/** Lo que el servidor le muestra a todos: nunca incluye los tokens */
export interface RoomSnapshot {
  code: string
  playerCount: PlayerCount
  status: RoomStatus
  players: OnlinePlayer[]
  state: GameState | null
}

export type ClientMessage =
  | { type: 'create'; playerCount: PlayerCount; starter: OnlineStarter; player: PlayerProfile }
  | { type: 'peek'; code: string }
  | { type: 'join'; code: string; player: PlayerProfile }
  | { type: 'rejoin'; code: string; token: string }
  | ({ type: 'move' } & Move)
  | { type: 'rematch' }
  | { type: 'leave' }

export type ServerMessage =
  | { type: 'welcome'; code: string; seat: Player; token: string }
  | { type: 'room'; room: RoomSnapshot }
  | { type: 'error'; message: string; fatal?: boolean }

export const ROOM_CODE_LENGTH = 4
export const MAX_NAME_LENGTH = 12
