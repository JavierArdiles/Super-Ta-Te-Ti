import { WIN_PATTERNS, isBoardFull, type CellValue, type GameState, type Player } from '../logic'

// Centro > esquinas > bordes, tanto en el tablero grande como dentro de cada sub-tablero
const POSITION_WEIGHT = [3, 2, 3, 2, 4, 2, 3, 2, 3]

const SUB_BOARD_WON = 100
const MACRO_TWO_IN_LINE = 300
const MACRO_ONE_IN_LINE = 30
const MICRO_TWO_IN_LINE = 8
const MICRO_ONE_IN_LINE = 1
const FREE_MOVE = 40

const BLOCKED = 'blocked'
type LineCell = CellValue | typeof BLOCKED

function lineScore(cells: LineCell[], me: Player, two: number, one: number): number {
  let score = 0
  for (const pattern of WIN_PATTERNS) {
    if (pattern.some(i => cells[i] === BLOCKED)) continue
    let mine = 0
    let theirs = 0
    for (const i of pattern) {
      if (cells[i] === me) mine++
      else if (cells[i] !== null) theirs++
    }
    if (theirs === 0) score += mine === 2 ? two : mine === 1 ? one : 0
    else if (mine === 0) score -= theirs === 2 ? two : theirs === 1 ? one : 0
  }
  return score
}

/** Puntaje de una posición sin ganador, desde el punto de vista de `me`. */
export function evaluate(state: GameState, me: Player): number {
  const { boards, boardWinners, nextBoardIndex, currentPlayer } = state
  let score = 0

  // Un sub-tablero lleno sin ganador no le sirve a nadie
  const macro: LineCell[] = boardWinners.map((winner, i) => winner ?? (isBoardFull(boards[i]) ? BLOCKED : null))
  score += lineScore(macro, me, MACRO_TWO_IN_LINE, MACRO_ONE_IN_LINE)

  boards.forEach((board, i) => {
    const weight = POSITION_WEIGHT[i]
    const winner = boardWinners[i]
    if (winner) {
      score += winner === me ? SUB_BOARD_WON * weight : -SUB_BOARD_WON * weight
      return
    }
    score += weight * lineScore(board, me, MICRO_TWO_IN_LINE, MICRO_ONE_IN_LINE)
    if (board[4] === me) score += weight
    else if (board[4] !== null) score -= weight
  })

  if (nextBoardIndex === null) score += currentPlayer === me ? FREE_MOVE : -FREE_MOVE

  return score
}
