import { applyMove, getLegalMoves, type GameState, type Player } from '../logic'
import { evaluate } from './evaluate'

export const WIN_SCORE = 1_000_000

// Con jugada libre puede haber hasta 81 opciones: se recorta la profundidad para que siga siendo rápido
const WIDE_BRANCHING = 20

function children(state: GameState) {
  return getLegalMoves(state)
    .map(move => applyMove(state, move.boardIndex, move.cellIndex))
    .sort((a, b) => Number(!!b.subBoardWon) - Number(!!a.subBoardWon))
    .map(result => result.state)
}

/** Minimax con poda alfa-beta. Las victorias más cercanas puntúan más alto. */
export function search(state: GameState, depth: number, alpha: number, beta: number, me: Player): number {
  if (state.winner) return state.winner === me ? WIN_SCORE + depth : -WIN_SCORE - depth
  if (state.draw) return 0

  const next = depth > 0 ? children(state) : []
  if (next.length === 0) return evaluate(state, me)

  const nextDepth = next.length > WIDE_BRANCHING ? depth - 2 : depth - 1
  const maximizing = state.currentPlayer === me

  let best = maximizing ? -Infinity : Infinity
  for (const child of next) {
    const score = search(child, Math.max(nextDepth, 0), alpha, beta, me)
    if (maximizing) {
      best = Math.max(best, score)
      alpha = Math.max(alpha, score)
    } else {
      best = Math.min(best, score)
      beta = Math.min(beta, score)
    }
    if (beta <= alpha) break
  }
  return best
}
