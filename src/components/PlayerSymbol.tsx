import { SYMBOLS, type PlayerAppearance } from './appearance'

interface PlayerSymbolProps {
  appearance: PlayerAppearance
  size?: number | string
}

export function PlayerSymbol({ appearance, size = '1em' }: PlayerSymbolProps) {
  const { rows } = SYMBOLS[appearance.symbol]
  return (
    <svg
      className="player-symbol"
      viewBox="0 0 7 7"
      width={size}
      height={size}
      fill={appearance.color}
      shapeRendering="crispEdges"
      aria-label={SYMBOLS[appearance.symbol].label}
    >
      {rows.flatMap((row, y) =>
        [...row].map((px, x) => (px === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null)),
      )}
    </svg>
  )
}
