import { WIN_PATTERNS, applyMove, getLegalMoves, isBoardFull, isGameOver, type CellValue, type GameState, type Move, type Player } from '../../logic'

export type ChatEventType =
  | 'start'
  | 'botMove'
  | 'draw'
  // Reacciones a tu jugada
  | 'humanWins'
  | 'humanWonBoard'
  | 'humanBlocked'
  | 'humanMissedWin'
  | 'humanNearBoard'
  | 'humanThreat'
  | 'freeMove'
  | 'humanGift'
  // Comentarios sobre la jugada del bot
  | 'botWins'
  | 'botWonBoard'
  | 'botBlocked'
  | 'botThreat'
  | 'botNearBoard'
  | 'botMissedWin'
  | 'botSent'

export interface ChatEvent {
  type: ChatEventType
  /** Sub-tablero del que se habla, si corresponde */
  board?: number
}

export const HUMAN_PRIORITY: ChatEventType[] = [
  'humanWins',
  'draw',
  'humanWonBoard',
  'humanBlocked',
  'humanGift',
  'humanMissedWin',
  'humanNearBoard',
  'humanThreat',
  'freeMove',
]

export const BOT_PRIORITY: ChatEventType[] = [
  'botWins',
  'draw',
  'botWonBoard',
  'botBlocked',
  'botThreat',
  'botNearBoard',
  'botMissedWin',
  'botSent',
]

/** Celdas que le completarían una línea a `player` en un sub-tablero */
function winningCells(board: CellValue[], player: Player): number[] {
  return WIN_PATTERNS.flatMap(line => {
    const empty = line.filter(i => board[i] === null)
    return line.filter(i => board[i] === player).length === 2 && empty.length === 1 ? empty : []
  })
}

/** Dos sub-tableros en línea y el tercero todavía se puede ganar */
function hasMacroThreat({ boardWinners, boards }: GameState, player: Player): boolean {
  return WIN_PATTERNS.some(line => {
    const owned = line.filter(i => boardWinners[i] === player).length
    const open = line.filter(i => boardWinners[i] === null && !isBoardFull(boards[i]))
    return owned === 2 && open.length === 1
  })
}

/** Sub-tablero que el jugador de turno puede ganar con una jugada legal */
function winnableBoard(state: GameState): number | null {
  const winning = getLegalMoves(state).find(m => applyMove(state, m.boardIndex, m.cellIndex).subBoardWon)
  return winning ? winning.boardIndex : null
}

/** Qué significó una jugada, comparando el estado antes y después */
export function detectEvents(before: GameState, move: Move, after: GameState, botPlayer: Player): ChatEvent[] {
  if (before === after) return []
  const mover = before.currentPlayer
  const rival = before.players.find(p => p !== mover)!
  const isBot = mover === botPlayer
  const actor = isBot ? 'bot' : 'human'
  const { boardIndex: board, cellIndex } = move
  const events: ChatEvent[] = []
  const wonBoard = after.boardWinners[board] !== before.boardWinners[board]
  const boardStillOpen = before.boardWinners[board] === null

  if (after.winner) events.push({ type: `${actor}Wins` })
  if (after.draw) events.push({ type: 'draw' })
  if (wonBoard) events.push({ type: `${actor}WonBoard`, board })

  if (boardStillOpen && !wonBoard && winningCells(before.boards[board], rival).includes(cellIndex)) {
    events.push({ type: `${actor}Blocked`, board })
  }

  if (!wonBoard) {
    const missed = winnableBoard(before)
    if (missed !== null) events.push({ type: `${actor}MissedWin`, board: missed })
  }

  if (
    boardStillOpen &&
    !wonBoard &&
    winningCells(after.boards[board], mover).length > 0 &&
    winningCells(before.boards[board], mover).length === 0
  ) {
    events.push({ type: `${actor}NearBoard`, board })
  }

  if (hasMacroThreat(after, mover) && !hasMacroThreat(before, mover)) events.push({ type: `${actor}Threat` })
  if (isGameOver(after)) return events
  if (!isBot && after.nextBoardIndex === null) events.push({ type: 'freeMove' })

  // Le dejaste al bot un sub-tablero servido
  const gift = isBot ? null : winnableBoard(after)
  if (gift !== null) events.push({ type: 'humanGift', board: gift })
  if (isBot && after.nextBoardIndex !== null) events.push({ type: 'botSent', board: after.nextBoardIndex })

  return events
}

/** El evento más importante según la prioridad dada, o null si no hay ninguno */
export function pickEvent(events: ChatEvent[], priority: ChatEventType[]): ChatEvent | null {
  for (const type of priority) {
    const event = events.find(e => e.type === type)
    if (event) return event
  }
  return null
}
