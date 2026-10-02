import { describe, expect, it } from 'vitest'
import { applyMove, createInitialState, getLegalMoves, isBoardPlayable, type GameState } from './logic'

function play(moves: [number, number][], state: GameState = createInitialState()) {
  for (const [b, c] of moves) state = applyMove(state, b, c).state
  return { state }
}

describe('applyMove', () => {
  it('places the mark, switches turn and forces the next board', () => {
    const { state } = play([[0, 4]])
    expect(state.boards[0][4]).toBe('X')
    expect(state.currentPlayer).toBe('O')
    expect(state.nextBoardIndex).toBe(4)
  })

  it('ignores moves outside the forced board', () => {
    const before = play([[0, 4]]).state
    expect(applyMove(before, 1, 0).state).toBe(before)
  })

  it('ignores moves on an occupied cell', () => {
    const before = play([[0, 0], [0, 0]]).state
    expect(before.boards[0][0]).toBe('X')
    expect(before.currentPlayer).toBe('O')
  })

  it('frees the next move when the target board is full', () => {
    const state = createInitialState()
    state.boards[4] = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O']
    const next = applyMove(state, 0, 4).state
    expect(next.nextBoardIndex).toBeNull()
    expect(isBoardPlayable(next, 4)).toBe(false)
    expect(isBoardPlayable(next, 7)).toBe(true)
  })

  it('lets the player go anywhere when the forced board is full', () => {
    const state = { ...createInitialState(), nextBoardIndex: 4 }
    state.boards[4] = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O']
    expect(applyMove(state, 2, 0).state.boards[2][0]).toBe('X')
  })

  it('reports a sub-board win', () => {
    const s = createInitialState()
    s.boards[0] = ['X', 'X', null, null, null, null, null, null, null]
    const result = applyMove(s, 0, 2)
    expect(result.subBoardWon).toEqual({ player: 'X', boardIndex: 0 })
    expect(result.state.boardWinners[0]).toBe('X')
    expect(result.state.currentPlayer).toBe('O')
  })

  it('ends the game when a player wins three boards in a row', () => {
    const s = createInitialState()
    s.boardWinners = ['X', 'X', null, null, null, null, null, null, null]
    s.boards[2] = ['X', 'X', null, null, null, null, null, null, null]
    const { state } = applyMove(s, 2, 2)
    expect(state.winner).toBe('X')
    expect(state.currentPlayer).toBe('X')
    expect(state.winningLine).toEqual([0, 1, 2])
    expect(state.boards.some((_, i) => isBoardPlayable(state, i))).toBe(false)
    expect(applyMove(state, 3, 0).state).toBe(state)
  })
})

describe('first player', () => {
  it('starts with the chosen player and keeps the rotation order', () => {
    let state = createInitialState(3, 'O')
    const turns = [state.currentPlayer]
    for (const [b, c] of [[0, 1], [1, 2], [2, 0]] as const) {
      state = applyMove(state, b, c).state
      turns.push(state.currentPlayer)
    }
    expect(turns).toEqual(['O', '!', 'X', 'O'])
    expect(state.boards[0][1]).toBe('O')
  })

  it('falls back to the first seat if the chosen player is not in the game', () => {
    expect(createInitialState(2, '!').currentPlayer).toBe('X')
  })
})

describe('3 players', () => {
  it('rotates turns X → O → ! → X', () => {
    let state = createInitialState(3)
    const turns = [state.currentPlayer]
    for (const [b, c] of [[0, 1], [1, 2], [2, 0]] as const) {
      state = applyMove(state, b, c).state
      turns.push(state.currentPlayer)
    }
    expect(turns).toEqual(['X', 'O', '!', 'X'])
    expect(state.boards[2][0]).toBe('!')
  })

  it('lets ! win a sub-board and the game', () => {
    const s = { ...createInitialState(3), currentPlayer: '!' as const }
    s.boardWinners = [null, null, null, '!', '!', null, null, null, null]
    s.boards[5] = ['!', '!', null, null, null, null, null, null, null]
    const result = applyMove(s, 5, 2)
    expect(result.subBoardWon).toEqual({ player: '!', boardIndex: 5 })
    expect(result.state.winner).toBe('!')
  })
})

describe('draw', () => {
  function almostFull() {
    // 80 celdas llenas sin ningún ta-te-ti, con la última libre en el tablero 8
    const state = createInitialState()
    const pattern: ('X' | 'O')[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']
    state.boards = state.boards.map(() => [...pattern])
    state.boards[8] = [...pattern.slice(0, 8), null]
    state.nextBoardIndex = 8
    return state
  }

  it('ends in a draw when every sub-board is full and nobody won', () => {
    const { state } = applyMove(almostFull(), 8, 8)
    expect(state.draw).toBe(true)
    expect(state.winner).toBeNull()
    expect(getLegalMoves(state)).toEqual([])
  })

  it('ignores moves after a draw', () => {
    const { state } = applyMove(almostFull(), 8, 8)
    expect(applyMove(state, 0, 0).state).toBe(state)
  })

  it('is not a draw while there are free cells', () => {
    expect(almostFull().draw).toBe(false)
    expect(getLegalMoves(almostFull())).toHaveLength(1)
  })
})

describe('getLegalMoves', () => {
  it('lists every empty cell when the move is free', () => {
    expect(getLegalMoves(createInitialState())).toHaveLength(81)
  })

  it('only lists empty cells of the forced board', () => {
    const state = applyMove(createInitialState(), 0, 4).state
    const moves = getLegalMoves(state)
    expect(moves).toHaveLength(9)
    expect(moves.every(m => m.boardIndex === 4)).toBe(true)
  })
})
