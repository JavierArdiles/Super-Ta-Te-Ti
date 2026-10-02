import type { BotLevel } from '../game/bot'
import avatarDificil from '../assets/bots/dificil.svg'
import avatarExperto from '../assets/bots/experto.svg'
import avatarFacil from '../assets/bots/facil.svg'
import avatarMedio from '../assets/bots/medio.svg'
import avatarMuyFacil from '../assets/bots/muy-facil.svg'
import bgDificil from '../assets/backgrounds/dificil.svg'
import bgExperto from '../assets/backgrounds/experto.svg'
import bgFacil from '../assets/backgrounds/facil.svg'
import bgMedio from '../assets/backgrounds/medio.svg'
import bgMuyFacil from '../assets/backgrounds/muy-facil.svg'

export const BOT_AVATARS: Record<BotLevel, string> = {
  'muy-facil': avatarMuyFacil,
  facil: avatarFacil,
  medio: avatarMedio,
  dificil: avatarDificil,
  experto: avatarExperto,
}

export const BOT_BACKGROUNDS: Record<BotLevel, string> = {
  'muy-facil': bgMuyFacil,
  facil: bgFacil,
  medio: bgMedio,
  dificil: bgDificil,
  experto: bgExperto,
}

export const BOT_COLORS: Record<BotLevel, string> = {
  'muy-facil': '#00ff00',
  facil: '#00ffff',
  medio: '#ffff00',
  dificil: '#ff8c00',
  // Mismo valor que el rojo de la paleta, para detectar si elegiste su color
  experto: '#ff3040',
}
