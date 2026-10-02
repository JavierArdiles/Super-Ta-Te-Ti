import { describe, expect, it } from 'vitest'
import { applyMove, createInitialState, type GameState } from '../../logic'
import { BOT_LEVELS, type BotLevel } from '../levels'
import { BOT_PRIORITY, HUMAN_PRIORITY, botComment, detectEvents, pickEvent, type ChatEventType } from '.'
import { LINES } from './lines'

const BOT = 'O'

function events(before: GameState, boardIndex: number, cellIndex: number) {
  return detectEvents(before, { boardIndex, cellIndex }, applyMove(before, boardIndex, cellIndex).state, BOT)
}

describe('detectEvents', () => {
  it('detects nothing special on a quiet move', () => {
    expect(events(createInitialState(), 0, 4)).toEqual([])
  })

  it('detects when you block a sub-board the bot was about to win', () => {
    const before = createInitialState()
    before.boards[3] = ['O', 'O', null, null, null, null, null, null, null]
    expect(events(before, 3, 2)).toContainEqual({ type: 'humanBlocked', board: 3 })
  })

  it('detects when you are about to win a sub-board', () => {
    const before = createInitialState()
    before.boards[5] = ['X', null, null, null, null, null, null, null, null]
    expect(events(before, 5, 1)).toContainEqual({ type: 'humanNearBoard', board: 5 })
  })

  it('detects a sub-board win you let slip', () => {
    const before = createInitialState()
    before.boards[2] = ['X', 'X', null, null, null, null, null, null, null]
    expect(events(before, 0, 8)).toContainEqual({ type: 'humanMissedWin', board: 2 })
  })

  it('detects the bot blocking you', () => {
    const before = { ...createInitialState(), currentPlayer: 'O' as const }
    before.boards[4] = ['X', null, null, null, 'X', null, null, null, null]
    expect(events(before, 4, 8)).toContainEqual({ type: 'botBlocked', board: 4 })
  })

  it('detects a sub-board won by you and the macro threat it creates', () => {
    const before = createInitialState()
    before.boardWinners[0] = 'X'
    before.boards[1] = ['X', 'X', null, null, null, null, null, null, null]
    const found = events(before, 1, 2).map(e => e.type)
    expect(found).toContain('humanWonBoard')
    expect(found).toContain('humanThreat')
    expect(found).not.toContain('humanMissedWin')
  })

  it('detects when you send the bot to a sub-board it can win', () => {
    const before = createInitialState()
    before.boards[6] = ['O', 'O', null, null, null, null, null, null, null]
    expect(events(before, 0, 6)).toContainEqual({ type: 'humanGift', board: 6 })
  })

  it('tells you where the bot sent you', () => {
    const before = { ...createInitialState(), currentPlayer: 'O' as const }
    expect(events(before, 0, 7)).toContainEqual({ type: 'botSent', board: 7 })
  })

  it('detects a free move given to the bot', () => {
    const before = createInitialState()
    before.boards[4] = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O']
    expect(events(before, 0, 4)).toContainEqual({ type: 'freeMove' })
  })

  it('detects the bot winning the game', () => {
    const before = { ...createInitialState(), currentPlayer: 'O' as const }
    before.boardWinners = ['O', 'O', null, null, null, null, null, null, null]
    before.boards[2] = ['O', 'O', null, null, null, null, null, null, null]
    expect(events(before, 2, 2)).toContainEqual({ type: 'botWins' })
  })

  it('detects a draw', () => {
    const before = createInitialState()
    const pattern: ('X' | 'O')[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']
    before.boards = before.boards.map(() => [...pattern])
    before.boards[8] = [...pattern.slice(0, 8), null]
    before.nextBoardIndex = 8
    expect(events(before, 8, 8)).toEqual([{ type: 'draw' }])
  })

  it('ignores moves that were rejected', () => {
    const before = createInitialState()
    expect(detectEvents(before, { boardIndex: 0, cellIndex: 0 }, before, BOT)).toEqual([])
  })
})

describe('pickEvent', () => {
  it('picks the most important event', () => {
    expect(pickEvent([{ type: 'humanNearBoard', board: 1 }, { type: 'humanBlocked', board: 2 }], HUMAN_PRIORITY)).toEqual({
      type: 'humanBlocked',
      board: 2,
    })
    expect(pickEvent([{ type: 'botNearBoard', board: 1 }, { type: 'botWins' }], BOT_PRIORITY)).toEqual({ type: 'botWins' })
    expect(pickEvent([], HUMAN_PRIORITY)).toBeNull()
  })
})

describe('botComment', () => {
  const levels = Object.keys(BOT_LEVELS) as BotLevel[]
  const types = Object.keys(LINES['muy-facil']) as ChatEventType[]

  it('has at least two lines for every level and event', () => {
    for (const level of levels) {
      for (const type of types) expect(LINES[level][type].length).toBeGreaterThan(1)
    }
  })

  it('names the sub-board it is talking about', () => {
    for (const level of levels) {
      const text = botComment({ type: 'humanBlocked', board: 4 }, level)
      expect(text).not.toContain('{tablero}')
    }
    expect(botComment({ type: 'humanWonBoard', board: 0 }, 'muy-facil', { random: () => 0 })).toContain(
      'el tablero de arriba a la izquierda',
    )
    expect(botComment({ type: 'botNearBoard', board: 8 }, 'experto', { random: () => 0 })).toBe(
      'El tablero de abajo a la derecha está condenado.',
    )
  })

  it('contracts "a el" and "de el"', () => {
    const texts = [0, 0.5, 0.99].map(r => botComment({ type: 'botSent', board: 2 }, 'medio', { random: () => r }))
    expect(texts.join(' ')).not.toMatch(/\b(a|de) el tablero/)
    expect(texts).toContain('Te envío al tablero de arriba a la derecha. Tus opciones ahí: limitadas.')
  })

  it('never repeats the last line', () => {
    const last = botComment({ type: 'botMove' }, 'experto', { random: () => 0 })
    for (let i = 0; i < 30; i++) expect(botComment({ type: 'botMove' }, 'experto', { last })).not.toBe(last)
  })
})
