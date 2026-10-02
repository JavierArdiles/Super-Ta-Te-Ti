import { useCallback, useEffect, useRef, useState } from 'react'
import { BOT_LEVELS, chooseMove, type BotLevel } from '../game/bot'
import { BOT_PRIORITY, HUMAN_PRIORITY, botComment, detectEvents, pickEvent, type ChatEvent } from '../game/bot/chat'
import { applyMove, createInitialState, isGameOver, type GameState, type Player } from '../game/logic'
import type { Appearances } from './appearance'
import { BotChat, type ChatMessage } from './BotChat'
import { BOT_PLAYER, MODES, type Mode } from './gameConfig'
import { MainBoard } from './MainBoard'
import { PlayerTag } from './PlayerTag'
import { SubWinMessage } from './SubWinMessage'

// Pausa variable para que el bot parezca pensar
const BOT_MIN_DELAY_MS = 900
const BOT_MAX_DELAY_MS = 1400

interface SubWin {
  id: number
  player: Player
  boardIndex: number
}

interface GameProps {
  mode: Mode
  level: BotLevel
  appearances: Appearances
  names: Record<Player, string>
  /** Se llama en cada partida nueva (puede ser al azar) */
  pickFirstPlayer: () => Player
  onExit: () => void
}

export function Game({ mode, level, appearances, names, pickFirstPlayer, onExit }: GameProps) {
  const playerCount = MODES.find(m => m.mode === mode)!.playerCount
  const chatId = useRef(0)

  const greeting = useCallback(
    // El saludo es siempre el primer mensaje: id 0; los demás se numeran desde 1
    (): ChatMessage[] => (mode === 'bot' ? [{ id: 0, text: botComment({ type: 'start' }, level) }] : []),
    [mode, level],
  )

  const [state, setState] = useState(() => createInitialState(playerCount, pickFirstPlayer()))
  const [subWin, setSubWin] = useState<SubWin | null>(null)
  const [chat, setChat] = useState<ChatMessage[]>(greeting)
  // Si el bot ya reaccionó a tu jugada, no hace falta un comentario genérico cuando juega
  const reactedThisRound = useRef(false)

  const isBotTurn = mode === 'bot' && state.currentPlayer === BOT_PLAYER && !isGameOver(state)

  const play = useCallback((current: GameState, boardIndex: number, cellIndex: number) => {
    const result = applyMove(current, boardIndex, cellIndex)
    setState(result.state)
    if (result.subBoardWon) setSubWin({ id: Date.now(), ...result.subBoardWon })
    return result.state
  }, [])

  const say = useCallback(
    (event: ChatEvent) => {
      const id = ++chatId.current
      setChat(prev => [...prev, { id, text: botComment(event, level, { last: prev.at(-1)?.text }) }])
    },
    [level],
  )

  useEffect(() => {
    if (!isBotTurn) return
    const timer = setTimeout(() => {
      const move = chooseMove(state, { level })
      if (!move) return
      const next = play(state, move.boardIndex, move.cellIndex)
      const event = pickEvent(detectEvents(state, move, next, BOT_PLAYER), BOT_PRIORITY)
      if (event) say(event)
      else if (!reactedThisRound.current) say({ type: 'botMove' })
      reactedThisRound.current = false
    }, BOT_MIN_DELAY_MS + Math.random() * (BOT_MAX_DELAY_MS - BOT_MIN_DELAY_MS))
    return () => clearTimeout(timer)
  }, [isBotTurn, state, level, play, say])

  const handleMove = (boardIndex: number, cellIndex: number) => {
    if (isBotTurn) return
    const next = play(state, boardIndex, cellIndex)
    if (mode !== 'bot' || next === state) return

    const reaction = pickEvent(detectEvents(state, { boardIndex, cellIndex }, next, BOT_PLAYER), HUMAN_PRIORITY)
    if (reaction) say(reaction)
    reactedThisRound.current = reaction !== null
  }

  const restart = () => {
    setState(createInitialState(playerCount, pickFirstPlayer()))
    setSubWin(null)
    setChat(greeting())
    reactedThisRound.current = false
  }

  const hideSubWin = useCallback(() => setSubWin(null), [])

  const modeLabel = MODES.find(m => m.mode === mode)!.label
  const configTitle = mode === 'bot' ? `${modeLabel} · ${BOT_LEVELS[level].label}` : modeLabel
  const player = (seat: Player) => <PlayerTag appearance={appearances[seat]} name={names[seat]} />

  return (
    <>
      <div className="config-title">{configTitle}</div>
      <div id="status">
        Turno de {player(state.currentPlayer)}
      </div>
      <div className="board-area">
        <MainBoard state={state} appearances={appearances} onMove={handleMove} />
        {subWin && (
          <SubWinMessage key={subWin.id} onDone={hideSubWin}>
            ¡{player(subWin.player)} ganó el tablero {subWin.boardIndex + 1}!
          </SubWinMessage>
        )}
        {mode === 'bot' && <BotChat level={level} messages={chat} typing={isBotTurn} />}
      </div>
      {state.winner && <div id="win-banner">¡{player(state.winner)} gana el juego!</div>}
      {state.draw && <div id="win-banner">¡Empate! Nadie gana esta vez.</div>}
      <div className="game-actions">
        <button onClick={restart}>Reiniciar</button>
        <button onClick={onExit}>Menú</button>
      </div>
    </>
  )
}
