import type { CellValue } from '../game/logic'
import type { Appearances } from './appearance'
import { PlayerSymbol } from './PlayerSymbol'

interface CellProps {
  value: CellValue
  appearances: Appearances
  onClick: () => void
}

export function Cell({ value, appearances, onClick }: CellProps) {
  return (
    <div className="cell" onClick={onClick}>
      {value && <PlayerSymbol appearance={appearances[value]} size={22} />}
    </div>
  )
}
