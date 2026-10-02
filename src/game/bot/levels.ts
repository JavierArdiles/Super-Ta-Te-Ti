export type BotLevel = 'muy-facil' | 'facil' | 'medio' | 'dificil' | 'experto'

export interface LevelConfig {
  label: string
  /** Nombre con el que se presenta en el chat */
  botName: string
  /** Cuántas jugadas hacia adelante mira */
  depth: number
  /** Probabilidad de elegir a propósito una jugada peor que la mejor */
  mistakeChance: number
  /** Cuánto peor que la mejor puede ser una jugada elegida por error */
  acceptable: number
}

export const BOT_LEVELS: Record<BotLevel, LevelConfig> = {
  'muy-facil': { label: 'Muy fácil', botName: 'BIPI', depth: 1, mistakeChance: 0.6, acceptable: 2000 },
  facil: { label: 'Fácil', botName: 'ROBI', depth: 2, mistakeChance: 0.35, acceptable: 600 },
  medio: { label: 'Medio', botName: 'CALCU-3000', depth: 3, mistakeChance: 0.15, acceptable: 200 },
  dificil: { label: 'Difícil', botName: 'DESTRUCTOR', depth: 4, mistakeChance: 0.05, acceptable: 100 },
  experto: { label: 'Experto', botName: 'OMEGA', depth: 6, mistakeChance: 0, acceptable: 0 },
}

export const DEFAULT_LEVEL: BotLevel = 'medio'
