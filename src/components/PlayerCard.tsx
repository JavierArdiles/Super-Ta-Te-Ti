import type { ReactNode } from 'react'
import { COLORS, SYMBOLS, SYMBOL_IDS, type PlayerAppearance } from './appearance'
import { PlayerSymbol } from './PlayerSymbol'

interface PlayerCardProps {
  title: string
  /** Si está, el título es un campo de texto editable */
  name?: { value: string; placeholder: string; maxLength: number; onChange: (name: string) => void }
  appearance: PlayerAppearance
  /** Símbolos y colores que ya eligió otro jugador */
  taken: PlayerAppearance[]
  onChange?: (appearance: PlayerAppearance) => void
  /** Reemplaza los selectores (por ejemplo, la tarjeta del bot) */
  readOnlyContent?: ReactNode
}

export function PlayerCard({ title, name, appearance, taken, onChange, readOnlyContent }: PlayerCardProps) {
  return (
    <section className="player-card" style={{ borderColor: appearance.color }}>
      {name ? (
        <input
          className="player-name"
          aria-label={`Nombre de ${title}`}
          value={name.value}
          placeholder={name.placeholder}
          maxLength={name.maxLength}
          spellCheck={false}
          onChange={e => name.onChange(e.target.value)}
        />
      ) : (
        <h2>{title}</h2>
      )}
      <div className="player-preview">
        <PlayerSymbol appearance={appearance} size={56} />
      </div>
      {readOnlyContent ?? (
        <>
          <div className="picker symbol-picker">
            {SYMBOL_IDS.map(symbol => (
              <button
                key={symbol}
                title={SYMBOLS[symbol].label}
                className={symbol === appearance.symbol ? 'active' : undefined}
                disabled={taken.some(t => t.symbol === symbol)}
                onClick={() => onChange?.({ ...appearance, symbol })}
              >
                <PlayerSymbol appearance={{ symbol, color: appearance.color }} size={20} />
              </button>
            ))}
          </div>
          <div className="picker color-picker">
            {COLORS.map(({ label, value }) => (
              <button
                key={value}
                title={label}
                className={value === appearance.color ? 'active' : undefined}
                disabled={taken.some(t => t.color === value)}
                style={{ background: value }}
                onClick={() => onChange?.({ ...appearance, color: value })}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
