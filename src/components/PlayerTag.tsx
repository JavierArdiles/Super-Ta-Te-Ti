import type { PlayerAppearance } from './appearance'
import { PlayerSymbol } from './PlayerSymbol'

interface PlayerTagProps {
  appearance: PlayerAppearance
  name: string
}

/** Ficha + nombre en el color del jugador */
export function PlayerTag({ appearance, name }: PlayerTagProps) {
  return (
    <span className="player-tag" style={{ color: appearance.color }}>
      <PlayerSymbol appearance={appearance} /> {name}
    </span>
  )
}
