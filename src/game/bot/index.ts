import { applyMove, getLegalMoves, type GameState, type Move } from '../logic'
import { BOT_LEVELS, DEFAULT_LEVEL, type BotLevel } from './levels'
import { WIN_SCORE, search } from './search'

export { BOT_LEVELS, DEFAULT_LEVEL, type BotLevel } from './levels'

// Diferencia de puntaje que se considera "igual de buena"
const NEAR_BEST = 10

export interface BotOptions {
  level?: BotLevel
  random?: () => number
}

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]
}

export function chooseMove(
  state: GameState,
  { level = DEFAULT_LEVEL, random = Math.random }: BotOptions = {},
): Move | null {
  const { depth, mistakeChance, acceptable } = BOT_LEVELS[level]
  const me = state.currentPlayer
  const moves = getLegalMoves(state)
  if (moves.length === 0) return null

  const scored = moves.map(move => ({
    move,
    score: search(applyMove(state, move.boardIndex, move.cellIndex).state, depth - 1, -Infinity, Infinity, me),
  }))
  const best = Math.max(...scored.map(s => s.score))

  // Ganar o salvar la partida no se regala nunca
  const decisive = best >= WIN_SCORE || best <= -WIN_SCORE
  if (!decisive && random() < mistakeChance) {
    return pick(scored.filter(s => s.score >= best - acceptable && s.score > -WIN_SCORE), random).move
  }

  return pick(scored.filter(s => s.score >= best - NEAR_BEST), random).move
}
