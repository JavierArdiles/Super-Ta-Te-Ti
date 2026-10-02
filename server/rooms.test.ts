import { describe, expect, it } from 'vitest'
import type { PlayerProfile } from '../src/online/protocol'
import { RoomManager, isError, snapshot } from './rooms'

const ana: PlayerProfile = { name: 'Ana', appearance: { symbol: 'star', color: '#ffff00' } }
const beto: PlayerProfile = { name: 'Beto', appearance: { symbol: 'heart', color: '#ff77cc' } }
const caro: PlayerProfile = { name: '', appearance: { symbol: 'star', color: '#ffff00' } }

function twoPlayerRoom() {
  const rooms = new RoomManager(() => 0)
  const { room, player: host } = rooms.create(2, 'creator', ana)
  const joined = rooms.join(room.code, beto)
  if (isError(joined)) throw new Error(joined.error)
  return { rooms, room, host, guest: joined.player }
}

describe('RoomManager', () => {
  it('creates a waiting room with a 4-letter code and the creator in the first seat', () => {
    const rooms = new RoomManager()
    const { room, player } = rooms.create(3, 'creator', ana)
    expect(room.code).toMatch(/^[A-Z2-9]{4}$/)
    expect(player.seat).toBe('X')
    expect(snapshot(room).status).toBe('waiting')
  })

  it('starts the game when the room is full, with the creator first', () => {
    const { room, guest } = twoPlayerRoom()
    expect(guest.seat).toBe('O')
    expect(snapshot(room).status).toBe('playing')
    expect(room.state!.currentPlayer).toBe('X')
  })

  it('rejects a player when the room is full and unknown rooms', () => {
    const { rooms, room } = twoPlayerRoom()
    expect(rooms.join(room.code, caro)).toEqual({ error: 'La sala ya está completa.' })
    expect(isError(rooms.join('ZZZZ', caro))).toBe(true)
  })

  it('gives a default name and a different look to a repeated appearance', () => {
    const rooms = new RoomManager()
    const { room } = rooms.create(3, 'creator', ana)
    const joined = rooms.join(room.code, caro)
    if (isError(joined)) throw new Error(joined.error)
    expect(joined.player.name).toBe('Jugador 2')
    expect(joined.player.appearance.symbol).not.toBe('star')
    expect(joined.player.appearance.color).not.toBe('#ffff00')
  })

  it('only lets you play on your turn and with legal moves', () => {
    const { rooms, room, host, guest } = twoPlayerRoom()
    expect(rooms.move(room.code, guest.token, { boardIndex: 0, cellIndex: 0 })).toEqual({ error: 'No es tu turno.' })
    expect(isError(rooms.move(room.code, host.token, { boardIndex: 0, cellIndex: 4 }))).toBe(false)
    expect(rooms.move(room.code, guest.token, { boardIndex: 0, cellIndex: 0 })).toEqual({ error: 'Esa jugada no es válida.' })
    expect(isError(rooms.move(room.code, guest.token, { boardIndex: 4, cellIndex: 0 }))).toBe(false)
    expect(rooms.move(room.code, 'nope', { boardIndex: 0, cellIndex: 0 })).toEqual({ error: 'No estás en esa sala.' })
  })

  it('lets a disconnected player come back to the same seat with the token', () => {
    const { rooms, room, guest } = twoPlayerRoom()
    rooms.setConnected(room, guest, false)
    expect(snapshot(room).players[1].connected).toBe(false)
    const back = rooms.rejoin(room.code, guest.token)
    if (isError(back)) throw new Error(back.error)
    expect(back.player.seat).toBe('O')
    expect(back.player.connected).toBe(true)
  })

  it('never exposes tokens in the snapshot', () => {
    const { room } = twoPlayerRoom()
    expect(JSON.stringify(snapshot(room))).not.toContain(room.players[0].token)
  })

  it('starts a rematch only after the game ended, rotating who starts', () => {
    const { rooms, room, host } = twoPlayerRoom()
    expect(isError(rooms.rematch(room.code, host.token))).toBe(true)
    room.state = { ...room.state!, winner: 'X' }
    expect(isError(rooms.rematch(room.code, host.token))).toBe(false)
    expect(room.state.winner).toBeNull()
    expect(room.state.currentPlayer).toBe('O')
  })

  it('frees the seat when leaving the waiting room and deletes empty rooms', () => {
    const rooms = new RoomManager()
    const { room, player } = rooms.create(3, 'creator', ana)
    const joined = rooms.join(room.code, beto)
    if (isError(joined)) throw new Error(joined.error)
    rooms.leave(room.code, joined.player.token)
    expect(room.players).toHaveLength(1)
    rooms.leave(room.code, player.token)
    expect(rooms.rooms.has(room.code)).toBe(false)
  })

  it('cleans up rooms that stayed empty for more than 10 minutes', () => {
    const { rooms, room, host, guest } = twoPlayerRoom()
    rooms.setConnected(room, host, false, 0)
    rooms.setConnected(room, guest, false, 0)
    rooms.cleanup(5 * 60 * 1000)
    expect(rooms.rooms.has(room.code)).toBe(true)
    rooms.cleanup(11 * 60 * 1000)
    expect(rooms.rooms.has(room.code)).toBe(false)
  })
})
