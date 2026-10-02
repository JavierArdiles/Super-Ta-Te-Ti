export type Player = 'X' | 'O' | '!'
export type PlayerCount = 2 | 3
export type CellValue = Player | null

export const PLAYERS_BY_COUNT: Record<PlayerCount, Player[]> = {
  2: ['X', 'O'],
  3: ['X', 'O', '!'],
}

export interface GameState {
  players: Player[]
  boards: CellValue[][]
  boardWinners: CellValue[]
  currentPlayer: Player
  nextBoardIndex: number | null
  winner: Player | null
  /** Todos los sub-tableros llenos y nadie ganó */
  draw: boolean
  winningLine: number[] | null
}

export interface Move {
  boardIndex: number
  cellIndex: number
}

export interface MoveResult {
  state: GameState
  subBoardWon?: { player: Player; boardIndex: number }
}

export const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

/** Los turnos siguen rotando en el orden X → O → !, arrancando por `firstPlayer` */
export function createInitialState(playerCount: PlayerCount = 2, firstPlayer: Player = 'X'): GameState {
  const players = PLAYERS_BY_COUNT[playerCount]
  return {
    players,
    boards: Array.from({ length: 9 }, () => Array(9).fill(null)),
    boardWinners: Array(9).fill(null),
    currentPlayer: players.includes(firstPlayer) ? firstPlayer : players[0],
    nextBoardIndex: null,
    winner: null,
    draw: false,
    winningLine: null,
  }
}

export function findWinningLine(cells: CellValue[], player: Player): number[] | null {
  return WIN_PATTERNS.find(pattern => pattern.every(index => cells[index] === player)) ?? null
}

export function checkWin(cells: CellValue[], player: Player): boolean {
  return findWinningLine(cells, player) !== null
}

export function isBoardFull(board: CellValue[]): boolean {
  return board.every(cell => cell !== null)
}

export function isGameOver(state: GameState): boolean {
  return state.winner !== null || state.draw
}

export function isBoardPlayable(state: GameState, boardIndex: number): boolean {
  const { nextBoardIndex, boards } = state
  return !isGameOver(state) && !isBoardFull(boards[boardIndex]) && (nextBoardIndex === null || nextBoardIndex === boardIndex)
}

export function getLegalMoves(state: GameState): Move[] {
  const moves: Move[] = []
  state.boards.forEach((board, boardIndex) => {
    if (!isBoardPlayable(state, boardIndex)) return
    board.forEach((cell, cellIndex) => {
      if (cell === null) moves.push({ boardIndex, cellIndex })
    })
  })
  return moves
}

function nextPlayer({ players, currentPlayer }: GameState): Player {
  return players[(players.indexOf(currentPlayer) + 1) % players.length]
}

export function applyMove(state: GameState, boardIndex: number, cellIndex: number): MoveResult {
  const { boards, boardWinners, currentPlayer, nextBoardIndex, winner } = state

  if (winner || state.draw) return { state }
  if (nextBoardIndex !== null && boardIndex !== nextBoardIndex && !isBoardFull(boards[nextBoardIndex])) {
    return { state }
  }
  if (boards[boardIndex][cellIndex]) return { state }

  const newBoards = boards.map((board, i) =>
    i === boardIndex ? board.map((cell, j) => (j === cellIndex ? currentPlayer : cell)) : board,
  )

  let newBoardWinners = boardWinners
  let subBoardWon: MoveResult['subBoardWon']

  if (!boardWinners[boardIndex] && checkWin(newBoards[boardIndex], currentPlayer)) {
    newBoardWinners = boardWinners.map((w, i) => (i === boardIndex ? currentPlayer : w))
    subBoardWon = { player: currentPlayer, boardIndex }

    const winningLine = findWinningLine(newBoardWinners, currentPlayer)
    if (winningLine) {
      return {
        state: { ...state, boards: newBoards, boardWinners: newBoardWinners, winner: currentPlayer, winningLine },
        subBoardWon,
      }
    }
  }

  return {
    state: {
      ...state,
      boards: newBoards,
      boardWinners: newBoardWinners,
      currentPlayer: nextPlayer(state),
      // Si el subtablero al que debe ir está completo, se puede jugar en cualquiera
      nextBoardIndex: isBoardFull(newBoards[cellIndex]) ? null : cellIndex,
      draw: newBoards.every(isBoardFull),
    },
    subBoardWon,
  }
}
