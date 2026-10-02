import type { CSSProperties } from 'react'
import type { CellValue } from '../game/logic'
import type { Appearances } from './appearance'
import { Cell } from './Cell'

interface SubBoardProps {
  cells: CellValue[]
  winner: CellValue
  highlighted: boolean
  appearances: Appearances
  onCellClick: (cellIndex: number) => void
}

export function SubBoard({ cells, winner, highlighted, appearances, onCellClick }: SubBoardProps) {
  const className = ['sub-board', winner && 'won', highlighted && 'highlight'].filter(Boolean).join(' ')
  const style = winner ? ({ '--win-color': appearances[winner].color } as CSSProperties) : undefined

  return (
    <div className={className} style={style}>
      {cells.map((value, i) => (
        <Cell key={i} value={value} appearances={appearances} onClick={() => onCellClick(i)} />
      ))}
    </div>
  )
}
