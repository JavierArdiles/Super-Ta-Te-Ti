import type { BotLevel } from '../game/bot'
import type { Player } from '../game/logic'

export type PickableSymbolId = 'x' | 'o' | 'bang' | 'triangle' | 'square' | 'star' | 'heart' | 'diamond' | 'bolt' | 'skull'
/** Ficha propia de cada bot: no se puede elegir en la pantalla previa */
export type BotSymbolId = `bot-${BotLevel}`
export type SymbolId = PickableSymbolId | BotSymbolId

// Pixel art 7×7; '#' = píxel pintado con el color del jugador
export const SYMBOLS: Record<SymbolId, { label: string; rows: string[] }> = {
  x: { label: 'Equis', rows: ['##...##', '##...##', '.##.##.', '..###..', '.##.##.', '##...##', '##...##'] },
  o: { label: 'Círculo', rows: ['.#####.', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'] },
  bang: { label: 'Exclamación', rows: ['..###..', '..###..', '..###..', '..###..', '.......', '..###..', '..###..'] },
  triangle: { label: 'Triángulo', rows: ['...#...', '..###..', '..###..', '.#####.', '.#####.', '#######', '#######'] },
  square: { label: 'Cuadrado', rows: ['#######', '#######', '##...##', '##...##', '##...##', '#######', '#######'] },
  star: { label: 'Estrella', rows: ['...#...', '...#...', '#######', '.#####.', '..###..', '.##.##.', '##...##'] },
  heart: { label: 'Corazón', rows: ['.##.##.', '#######', '#######', '#######', '.#####.', '..###..', '...#...'] },
  diamond: { label: 'Rombo', rows: ['...#...', '..###..', '.#####.', '#######', '.#####.', '..###..', '...#...'] },
  bolt: { label: 'Rayo', rows: ['...###.', '..###..', '.###...', '#######', '...###.', '..###..', '.###...'] },
  skull: { label: 'Calavera', rows: ['.#####.', '#######', '#..#..#', '#######', '.##.##.', '.#####.', '.#.#.#.'] },
  'bot-muy-facil': { label: 'BIPI', rows: ['...#...', '.#####.', '#.###.#', '#######', '#.###.#', '##...##', '.#####.'] },
  'bot-facil': { label: 'ROBI', rows: ['...#...', '#######', '##.#.##', '#######', '##...##', '#######', '.#...#.'] },
  'bot-medio': { label: 'CALCU-3000', rows: ['.#...#.', '#######', '#..#..#', '#######', '##...##', '#######', '.#####.'] },
  'bot-dificil': { label: 'DESTRUCTOR', rows: ['#.....#', '##...##', '#######', '#.###.#', '##.#.##', '#.#.#.#', '#######'] },
  'bot-experto': { label: 'OMEGA', rows: ['#.#.#.#', '#######', '#..#..#', '#..#..#', '###.###', '.#.#.#.', '.#####.'] },
}

export const SYMBOL_IDS: PickableSymbolId[] = ['x', 'o', 'bang', 'triangle', 'square', 'star', 'heart', 'diamond', 'bolt', 'skull']

export const COLORS: { label: string; value: string }[] = [
  { label: 'Magenta', value: '#ff00ff' },
  { label: 'Cian', value: '#00ffff' },
  { label: 'Naranja', value: '#ff8c00' },
  { label: 'Verde', value: '#00ff00' },
  { label: 'Amarillo', value: '#ffff00' },
  { label: 'Rojo', value: '#ff3040' },
  { label: 'Azul', value: '#4d7cff' },
  { label: 'Blanco', value: '#ffffff' },
  { label: 'Rosa', value: '#ff77cc' },
  { label: 'Violeta', value: '#b066ff' },
]

export interface PlayerAppearance {
  symbol: SymbolId
  color: string
}

export type Appearances = Record<Player, PlayerAppearance>

export const DEFAULT_APPEARANCES: Appearances = {
  X: { symbol: 'x', color: '#ff00ff' },
  O: { symbol: 'o', color: '#00ffff' },
  '!': { symbol: 'bang', color: '#ff8c00' },
}

function firstFree<T>(options: T[], preferred: T, taken: T[]): T {
  if (!taken.includes(preferred)) return preferred
  return options.find(o => !taken.includes(o)) ?? preferred
}

/**
 * Garantiza que los jugadores activos no compartan símbolo ni color:
 * el primero conserva lo suyo y los siguientes toman lo primero libre.
 */
export function makeDistinct(appearances: Appearances, seats: Player[]): Appearances {
  const result = { ...appearances }
  const colorValues = COLORS.map(c => c.value)
  seats.forEach((seat, i) => {
    const before = seats.slice(0, i).map(s => result[s])
    result[seat] = {
      symbol: firstFree(SYMBOL_IDS, result[seat].symbol, before.map(a => a.symbol)),
      color: firstFree(colorValues, result[seat].color, before.map(a => a.color)),
    }
  })
  return result
}

/** La misma apariencia, cambiando el símbolo o el color si ya los tiene otro */
export function avoidTaken(appearance: PlayerAppearance, taken: PlayerAppearance[]): PlayerAppearance {
  return {
    symbol: firstFree<SymbolId>(SYMBOL_IDS, appearance.symbol, taken.map(t => t.symbol)),
    color: firstFree(COLORS.map(c => c.value), appearance.color, taken.map(t => t.color)),
  }
}

export function isValidAppearance(value: unknown): value is PlayerAppearance {
  const a = value as PlayerAppearance
  return !!a && SYMBOL_IDS.includes(a.symbol as PickableSymbolId) && COLORS.some(c => c.value === a.color)
}
