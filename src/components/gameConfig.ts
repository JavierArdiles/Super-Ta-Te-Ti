import { BOT_LEVELS, DEFAULT_LEVEL, type BotLevel } from '../game/bot'
import { PLAYERS_BY_COUNT, type Player, type PlayerCount } from '../game/logic'
import { COLORS, DEFAULT_APPEARANCES, isValidAppearance, makeDistinct, type Appearances } from './appearance'
import { MAX_NAME_LENGTH, type OnlineStarter } from '../online/protocol'
import { BOT_COLORS } from './botArt'

export { MAX_NAME_LENGTH }

export type Mode = '2p' | '3p' | 'bot' | 'online'

export const MODES: { mode: Mode; label: string; playerCount: PlayerCount }[] = [
  { mode: '2p', label: '2 jugadores', playerCount: 2 },
  { mode: '3p', label: '3 jugadores', playerCount: 3 },
  { mode: 'bot', label: 'vs Bot', playerCount: 2 },
  // En online la cantidad de jugadores se elige aparte (onlinePlayerCount)
  { mode: 'online', label: 'Online', playerCount: 2 },
]

export const BOT_PLAYER: Player = 'O'

export interface GameConfig {
  mode: Mode
  level: BotLevel
  /** Lo que eligió cada jugador humano; la ficha del bot se calcula aparte */
  appearances: Appearances
  /** Nombres escritos por los jugadores; vacío = nombre por defecto */
  names: Record<Player, string>
  /** Quién empieza: un asiento o al azar en cada partida */
  firstPlayer: Player | 'random'
  onlinePlayerCount: PlayerCount
  onlineStarter: OnlineStarter
}

/** Quién empieza esta partida; si el elegido no juega en este modo, empieza el primero */
export function resolveFirstPlayer({ mode, firstPlayer }: GameConfig, random = Math.random): Player {
  const seats = seatsFor(mode)
  if (firstPlayer === 'random') return seats[Math.floor(random() * seats.length)]
  return seats.includes(firstPlayer) ? firstPlayer : seats[0]
}


/** Nombre que se muestra si el jugador no escribió uno */
export function defaultName(mode: Mode, seat: Player): string {
  if (mode === 'bot' || mode === 'online') return 'Vos'
  return `Jugador ${PLAYERS_BY_COUNT[3].indexOf(seat) + 1}`
}

/** Nombres que se usan en la partida; en vs Bot, el bot usa el suyo */
export function resolveNames({ mode, level, names }: GameConfig): Record<Player, string> {
  const result = {} as Record<Player, string>
  for (const seat of PLAYERS_BY_COUNT[3]) result[seat] = names[seat].trim() || defaultName(mode, seat)
  if (mode === 'bot') result[BOT_PLAYER] = BOT_LEVELS[level].botName
  return result
}

/** Jugadores que se configuran en esta pantalla; en online solo configurás el tuyo */
export function seatsFor(mode: Mode): Player[] {
  if (mode === 'online') return ['X']
  return PLAYERS_BY_COUNT[MODES.find(m => m.mode === mode)!.playerCount]
}

/** Apariencias que se usan en la partida. En vs Bot, el bot juega siempre con su ficha y su color */
export function resolveAppearances({ mode, level, appearances }: GameConfig): Appearances {
  if (mode !== 'bot') return makeDistinct(appearances, seatsFor(mode))
  const botColor = BOT_COLORS[level]
  const human = appearances.X
  // Si tenías guardado el color de este bot (por ejemplo, al cambiar de nivel), te toca otro
  const humanColor = human.color !== botColor ? human.color : COLORS.find(c => c.value !== botColor)!.value
  return { ...appearances, X: { ...human, color: humanColor }, [BOT_PLAYER]: { symbol: `bot-${level}`, color: botColor } }
}

const STORAGE_KEY = 'super-ta-te-ti:config'

const DEFAULT_CONFIG: GameConfig = {
  mode: '2p',
  level: DEFAULT_LEVEL,
  appearances: DEFAULT_APPEARANCES,
  names: { X: '', O: '', '!': '' },
  firstPlayer: 'X',
  onlinePlayerCount: 2,
  onlineStarter: 'creator',
}

export function loadConfig(): GameConfig {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<GameConfig> | null
    if (!saved) return DEFAULT_CONFIG
    const appearances = { ...DEFAULT_APPEARANCES }
    const names = { ...DEFAULT_CONFIG.names }
    for (const seat of Object.keys(appearances) as Player[]) {
      if (isValidAppearance(saved.appearances?.[seat])) appearances[seat] = saved.appearances[seat]
      const name = saved.names?.[seat]
      if (typeof name === 'string') names[seat] = name.slice(0, MAX_NAME_LENGTH)
    }
    return {
      mode: MODES.some(m => m.mode === saved.mode) ? saved.mode! : DEFAULT_CONFIG.mode,
      level: saved.level && saved.level in BOT_LEVELS ? saved.level : DEFAULT_CONFIG.level,
      appearances,
      names,
      firstPlayer:
        saved.firstPlayer === 'random' || PLAYERS_BY_COUNT[3].includes(saved.firstPlayer as Player)
          ? saved.firstPlayer!
          : DEFAULT_CONFIG.firstPlayer,
      onlinePlayerCount: saved.onlinePlayerCount === 3 ? 3 : 2,
      onlineStarter: saved.onlineStarter === 'random' ? 'random' : 'creator',
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveConfig(config: GameConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // Sin almacenamiento (modo privado, etc.) simplemente no se recuerda
  }
}
