import { BOT_LEVELS, type BotLevel } from '../game/bot'
import type { Player } from '../game/logic'
import { makeDistinct, type PlayerAppearance } from './appearance'
import { BOT_AVATARS } from './botArt'
import {
  BOT_PLAYER,
  MAX_NAME_LENGTH,
  MODES,
  defaultName,
  resolveFirstPlayer,
  resolveAppearances,
  resolveNames,
  seatsFor,
  type GameConfig,
  type Mode,
} from './gameConfig'
import { PlayerCard } from './PlayerCard'
import { PlayerSymbol } from './PlayerSymbol'

interface SetupProps {
  config: GameConfig
  onChange: (config: GameConfig) => void
  onPlay: () => void
}

export function Setup({ config, onChange, onPlay }: SetupProps) {
  const { mode, level } = config
  const seats = seatsFor(mode)
  const appearances = resolveAppearances(config)

  const setMode = (newMode: Mode) =>
    onChange({ ...config, mode: newMode, appearances: makeDistinct(config.appearances, seatsFor(newMode)) })

  const setAppearance = (seat: Player, appearance: PlayerAppearance) =>
    onChange({ ...config, appearances: { ...config.appearances, [seat]: appearance } })

  const names = resolveNames(config)
  const resolvedFirst = config.firstPlayer === 'random' ? null : resolveFirstPlayer(config)

  const setName = (seat: Player, name: string) => onChange({ ...config, names: { ...config.names, [seat]: name } })

  return (
    <div className="setup">
      <div className="mode-selector">
        {MODES.map(({ mode: m, label }) => (
          <button key={m} className={m === mode ? 'active' : undefined} onClick={() => setMode(m)}>
            {label}
          </button>
        ))}
      </div>

      {mode === 'bot' && (
        <div className="mode-selector level-selector">
          {(Object.keys(BOT_LEVELS) as BotLevel[]).map(l => (
            <button key={l} className={l === level ? 'active' : undefined} onClick={() => onChange({ ...config, level: l })}>
              <img src={BOT_AVATARS[l]} alt="" />
              {BOT_LEVELS[l].label}
            </button>
          ))}
        </div>
      )}

      <div className="player-cards">
        {seats.map(seat => {
          const isBot = mode === 'bot' && seat === BOT_PLAYER
          const taken = seats.filter(s => s !== seat).map(s => appearances[s])
          return (
            <PlayerCard
              key={seat}
              title={names[seat]}
              name={
                isBot
                  ? undefined
                  : {
                      value: config.names[seat],
                      placeholder: defaultName(mode, seat),
                      maxLength: MAX_NAME_LENGTH,
                      onChange: n => setName(seat, n),
                    }
              }
              appearance={appearances[seat]}
              taken={taken}
              onChange={a => setAppearance(seat, a)}
              readOnlyContent={
                isBot ? (
                  <div className="bot-card-info">
                    <img src={BOT_AVATARS[level]} alt="" />
                    <p>Juega con su propia ficha.</p>
                  </div>
                ) : undefined
              }
            />
          )
        })}
      </div>

      {mode === 'online' ? (
        <div className="first-player">
          <h2>Jugadores</h2>
          <div className="mode-selector first-player-selector">
            {([2, 3] as const).map(count => (
              <button
                key={count}
                className={config.onlinePlayerCount === count ? 'active' : undefined}
                onClick={() => onChange({ ...config, onlinePlayerCount: count })}
              >
                {count} jugadores
              </button>
            ))}
          </div>
          <h2>¿Quién empieza?</h2>
          <div className="mode-selector first-player-selector">
            {(
              [
                ['creator', 'Yo'],
                ['random', 'Al azar'],
              ] as const
            ).map(([starter, label]) => (
              <button
                key={starter}
                className={config.onlineStarter === starter ? 'active' : undefined}
                onClick={() => onChange({ ...config, onlineStarter: starter })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="first-player">
          <h2>¿Quién empieza?</h2>
          <div className="mode-selector first-player-selector">
            {seats.map(seat => (
              <button
                key={seat}
                className={resolvedFirst === seat ? 'active' : undefined}
                onClick={() => onChange({ ...config, firstPlayer: seat })}
              >
                <PlayerSymbol appearance={appearances[seat]} /> {names[seat]}
              </button>
            ))}
            <button className={config.firstPlayer === 'random' ? 'active' : undefined} onClick={() => onChange({ ...config, firstPlayer: 'random' })}>
              Al azar
            </button>
          </div>
        </div>
      )}

      <button className="play-button" onClick={onPlay}>
        {mode === 'online' ? 'Crear sala' : '¡Jugar!'}
      </button>
    </div>
  )
}
