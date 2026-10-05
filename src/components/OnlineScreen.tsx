import { useCallback, useEffect, useRef, useState } from 'react'
import { PLAYERS_BY_COUNT, type Player } from '../game/logic'
import type { PlayerProfile, RoomSnapshot } from '../online/protocol'
import { useOnlineRoom, type OnlineIntent } from '../online/useOnlineRoom'
import { DEFAULT_APPEARANCES, avoidTaken, type Appearances } from './appearance'
import { MAX_NAME_LENGTH } from './gameConfig'
import { MainBoard } from './MainBoard'
import { PlayerCard } from './PlayerCard'
import { PlayerTag } from './PlayerTag'
import { SubWinMessage } from './SubWinMessage'
import { prepareTurnAlerts, useTurnNotification } from './turnNotification'

interface OnlineScreenProps {
  intent: OnlineIntent
  profile: PlayerProfile
  onProfileChange: (profile: PlayerProfile) => void
  onExit: () => void
}

export function OnlineScreen({ intent, profile, onProfileChange, onExit }: OnlineScreenProps) {
  const online = useOnlineRoom(intent)
  const { room, seat, error } = online

  const exit = () => {
    online.leave()
    onExit()
  }

  if (error?.fatal) {
    return (
      <div className="online-panel">
        <p>{error.message}</p>
        <button onClick={exit}>Volver al menú</button>
      </div>
    )
  }

  if (!room) return <div className="online-panel">{online.connected ? 'Entrando a la sala…' : 'Conectando con el servidor…'}</div>

  if (!seat) {
    // Tu ficha guardada puede coincidir con la de alguien que ya está en la sala
    const available = { ...profile, appearance: avoidTaken(profile.appearance, room.players.map(p => p.appearance)) }
    return <JoinPanel room={room} profile={available} onProfileChange={onProfileChange} onJoin={() => {
          prepareTurnAlerts()
          online.join(available)
        }} onExit={exit} />
  }

  if (room.status === 'waiting') return <Lobby room={room} seat={seat} onExit={exit} />

  return (
    <OnlineGame
      room={room}
      seat={seat}
      connected={online.connected}
      error={error?.message ?? null}
      onClearError={online.clearError}
      onMove={online.move}
      onRematch={online.rematch}
      onExit={exit}
    />
  )
}

function lookOf(room: RoomSnapshot) {
  const appearances: Appearances = { ...DEFAULT_APPEARANCES }
  const names = {} as Record<Player, string>
  for (const p of room.players) {
    appearances[p.seat] = p.appearance
    names[p.seat] = p.name
  }
  return { appearances, names }
}

function PlayersList({ room, seat }: { room: RoomSnapshot; seat: Player | null }) {
  return (
    <ul className="online-players">
      {PLAYERS_BY_COUNT[room.playerCount].map(s => {
        const player = room.players.find(p => p.seat === s)
        return (
          <li key={s}>
            {player ? (
              <>
                <PlayerTag appearance={player.appearance} name={player.name} />
                {s === seat && <span className="muted"> (vos)</span>}
                {!player.connected && <span className="warning"> desconectado</span>}
              </>
            ) : (
              <span className="muted">Esperando jugador…</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

interface JoinPanelProps {
  room: RoomSnapshot
  profile: PlayerProfile
  onProfileChange: (profile: PlayerProfile) => void
  onJoin: () => void
  onExit: () => void
}

function JoinPanel({ room, profile, onProfileChange, onJoin, onExit }: JoinPanelProps) {
  const full = room.players.length >= room.playerCount
  return (
    <div className="setup">
      <h2 className="online-title">Sala {room.code}</h2>
      <PlayersList room={room} seat={null} />
      {full ? (
        <p className="warning">La sala ya está completa.</p>
      ) : (
        <PlayerCard
          title={profile.name || 'Vos'}
          name={{ value: profile.name, placeholder: 'Tu nombre', maxLength: MAX_NAME_LENGTH, onChange: name => onProfileChange({ ...profile, name }) }}
          appearance={profile.appearance}
          taken={room.players.map(p => p.appearance)}
          onChange={appearance => onProfileChange({ ...profile, appearance })}
        />
      )}
      <div className="game-actions">
        {!full && (
          <button className="play-button" onClick={onJoin}>
            Unirme
          </button>
        )}
        <button onClick={onExit}>Menú</button>
      </div>
    </div>
  )
}

function Lobby({ room, seat, onExit }: { room: RoomSnapshot; seat: Player; onExit: () => void }) {
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}/?sala=${room.code}`
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="online-panel">
      <h2 className="online-title">Sala {room.code}</h2>
      <p>Compartí este link con tus amigos:</p>
      <div className="lobby-link">
        <code>{link}</code>
        <button onClick={copy}>{copied ? '¡Copiado!' : 'Copiar link'}</button>
      </div>
      {isLocal && (
        <p className="warning">
          Estás usando el juego desde tu compu (localhost): este link solo funciona acá. Para jugar con alguien de afuera, abrí
          el juego desde la dirección del túnel.
        </p>
      )}
      <PlayersList room={room} seat={seat} />
      <p className="muted">La partida empieza sola cuando estén todos.</p>
      <button onClick={onExit}>Salir</button>
    </div>
  )
}

interface OnlineGameProps {
  room: RoomSnapshot
  seat: Player
  connected: boolean
  error: string | null
  onClearError: () => void
  onMove: (move: { boardIndex: number; cellIndex: number }) => void
  onRematch: () => void
  onExit: () => void
}

function OnlineGame({ room, seat, connected, error, onClearError, onMove, onRematch, onExit }: OnlineGameProps) {
  const state = room.state!
  const { appearances, names } = lookOf(room)
  const [subWin, setSubWin] = useState<{ id: number; player: Player; boardIndex: number } | null>(null)
  const previousWinners = useRef(state.boardWinners)
  const myTurn = state.currentPlayer === seat && !state.winner && !state.draw
  const tag = (s: Player) => <PlayerTag appearance={appearances[s]} name={names[s]} />

  useTurnNotification(myTurn, `Sala ${room.code}`)

  // El servidor solo manda el estado: el cartel de sub-tablero ganado se deduce comparando
  useEffect(() => {
    const won = state.boardWinners.findIndex((w, i) => w && !previousWinners.current[i])
    previousWinners.current = state.boardWinners
    if (won >= 0) setSubWin({ id: Date.now(), player: state.boardWinners[won]!, boardIndex: won })
  }, [state.boardWinners])

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(onClearError, 2500)
    return () => clearTimeout(timer)
  }, [error, onClearError])

  const hideSubWin = useCallback(() => setSubWin(null), [])

  return (
    <>
      <div className="config-title">Online · Sala {room.code}</div>
      <PlayersList room={room} seat={seat} />
      <div id="status">
        {state.winner || state.draw ? 'Partida terminada' : myTurn ? '¡Tu turno!' : <>Turno de {tag(state.currentPlayer)}</>}
      </div>
      <div className="board-area">
        <MainBoard state={state} appearances={appearances} onMove={(boardIndex, cellIndex) => myTurn && onMove({ boardIndex, cellIndex })} />
        {subWin && (
          <SubWinMessage key={subWin.id} onDone={hideSubWin}>
            ¡{tag(subWin.player)} ganó el tablero {subWin.boardIndex + 1}!
          </SubWinMessage>
        )}
      </div>
      {(error || !connected) && <p className="warning">{!connected ? 'Se cortó la conexión. Reconectando…' : error}</p>}
      {state.winner && <div id="win-banner">¡{tag(state.winner)} gana el juego!</div>}
      {state.draw && <div id="win-banner">¡Empate! Nadie gana esta vez.</div>}
      <div className="game-actions">
        {(state.winner || state.draw) && <button onClick={onRematch}>Revancha</button>}
        <button onClick={onExit}>Salir</button>
      </div>
    </>
  )
}
