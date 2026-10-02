import type { CSSProperties } from 'react'
import { isBoardPlayable, type GameState } from '../game/logic'
import type { Appearances } from './appearance'
import { SubBoard } from './SubBoard'

interface MainBoardProps {
  state: GameState
  appearances: Appearances
  onMove: (boardIndex: number, cellIndex: number) => void
}

export function MainBoard({ state, appearances, onMove }: MainBoardProps) {
  const style = { '--turn-color': appearances[state.currentPlayer].color } as CSSProperties

  return (
    <div id="main-board" style={style}>
      {state.boards.map((cells, i) => (
        <SubBoard
          key={i}
          cells={cells}
          winner={state.boardWinners[i]}
          highlighted={state.winningLine ? state.winningLine.includes(i) : isBoardPlayable(state, i)}
          appearances={appearances}
          onCellClick={cellIndex => onMove(i, cellIndex)}
        />
      ))}
    </div>
  )
}
