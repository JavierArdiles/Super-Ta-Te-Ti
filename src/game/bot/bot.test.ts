import { describe, expect, it } from 'vitest'
import { applyMove, createInitialState, getLegalMoves, type GameState, type Move } from '../logic'
import { BOT_LEVELS, chooseMove, type BotLevel } from '.'

function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function canWinNow(state: GameState) {
  return getLegalMoves(state).some(m => applyMove(state, m.boardIndex, m.cellIndex).state.winner)
}

describe('chooseMove', () => {
  it('returns a legal move', () => {
    const random = seeded(1)
    let state = createInitialState()
    for (let i = 0; i < 20 && !state.winner; i++) {
      const move = chooseMove(state, { random }) as Move
      expect(getLegalMoves(state)).toContainEqual(move)
      state = applyMove(state, move.boardIndex, move.cellIndex).state
    }
  })

  it('takes an immediate game win', () => {
    const state = { ...createInitialState(), currentPlayer: 'O' as const }
    state.boardWinners = ['O', 'O', null, null, null, null, null, null, null]
    state.boards[2] = ['O', 'O', null, 'X', 'X', null, null, null, null]
    for (let seed = 0; seed < 10; seed++) {
      expect(chooseMove(state, { random: seeded(seed) })).toEqual({ boardIndex: 2, cellIndex: 2 })
    }
  })

  it('never leaves the rival an immediate game win when it can avoid it', () => {
    const state = { ...createInitialState(), currentPlayer: 'O' as const }
    state.boardWinners = ['X', 'X', null, null, null, null, null, null, null]
    state.boards[2] = ['X', 'X', null, null, null, null, null, null, null]
    for (let seed = 0; seed < 10; seed++) {
      const move = chooseMove(state, { random: seeded(seed) }) as Move
      expect(canWinNow(applyMove(state, move.boardIndex, move.cellIndex).state)).toBe(false)
    }
  })

  it('beats a random player most of the time', () => {
    const random = seeded(42)
    let botWins = 0
    for (let game = 0; game < 20; game++) {
      let state = createInitialState()
      while (!state.winner) {
        const moves = getLegalMoves(state)
        if (moves.length === 0) break
        const move = state.currentPlayer === 'O' ? (chooseMove(state, { random }) as Move) : moves[Math.floor(random() * moves.length)]
        state = applyMove(state, move.boardIndex, move.cellIndex).state
      }
      if (state.winner === 'O') botWins++
    }
    expect(botWins).toBeGreaterThanOrEqual(17)
  })
})

describe('levels', () => {
  const levels = Object.keys(BOT_LEVELS) as BotLevel[]

  it.each(levels)('%s plays legal moves and takes an immediate game win', level => {
    const random = seeded(7)
    let state = createInitialState()
    for (let i = 0; i < 10; i++) {
      const move = chooseMove(state, { level, random }) as Move
      expect(getLegalMoves(state)).toContainEqual(move)
      state = applyMove(state, move.boardIndex, move.cellIndex).state
    }

    const winning = { ...createInitialState(), currentPlayer: 'O' as const }
    winning.boardWinners = ['O', 'O', null, null, null, null, null, null, null]
    winning.boards[2] = ['O', 'O', null, 'X', 'X', null, null, null, null]
    expect(chooseMove(winning, { level, random })).toEqual({ boardIndex: 2, cellIndex: 2 })
  })

  it('makes fewer mistakes as the level goes up', () => {
    const chances = levels.map(level => BOT_LEVELS[level].mistakeChance)
    expect([...chances].sort((a, b) => b - a)).toEqual(chances)
  })
})
