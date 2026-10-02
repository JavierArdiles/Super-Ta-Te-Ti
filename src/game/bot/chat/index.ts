import type { BotLevel } from '../levels'
import type { ChatEvent } from './events'
import { LINES } from './lines'

export { BOT_PRIORITY, HUMAN_PRIORITY, detectEvents, pickEvent, type ChatEvent, type ChatEventType } from './events'

const BOARD_NAMES = [
  'de arriba a la izquierda',
  'de arriba al medio',
  'de arriba a la derecha',
  'del medio a la izquierda',
  'del centro',
  'del medio a la derecha',
  'de abajo a la izquierda',
  'de abajo al medio',
  'de abajo a la derecha',
]

interface CommentOptions {
  random?: () => number
  /** Última frase dicha, para no repetirla */
  last?: string
}

export function botComment(event: ChatEvent, level: BotLevel, { random = Math.random, last }: CommentOptions = {}): string {
  const lines = LINES[level][event.type].map(line =>
    line
      .replace('{tablero}', `el tablero ${BOARD_NAMES[event.board ?? 4]}`)
      // Contracciones: "a el" → "al", "de el" → "del"
      .replace(/\b(a|de) el tablero/i, '$1l tablero'),
  )
  const options = lines.length > 1 ? lines.filter(line => line !== last) : lines
  const text = options[Math.floor(random() * options.length)]
  return text.charAt(0).toUpperCase() + text.slice(1)
}
