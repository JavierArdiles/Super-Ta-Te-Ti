import { useEffect, useRef, type CSSProperties } from 'react'
import { BOT_LEVELS, type BotLevel } from '../game/bot'
import { BOT_AVATARS, BOT_COLORS } from './botArt'

export interface ChatMessage {
  id: number
  text: string
}

interface BotChatProps {
  level: BotLevel
  messages: ChatMessage[]
  typing: boolean
}

export function BotChat({ level, messages, typing }: BotChatProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages, typing])

  return (
    <aside className="bot-chat" style={{ '--bot-color': BOT_COLORS[level] } as CSSProperties}>
      <header>
        <img src={BOT_AVATARS[level]} alt="" />
        {BOT_LEVELS[level].botName}
      </header>
      <div className="bot-chat-messages" ref={listRef}>
        {messages.map(m => (
          <p key={m.id}>{m.text}</p>
        ))}
        {typing && <p className="typing">escribiendo</p>}
      </div>
    </aside>
  )
}
