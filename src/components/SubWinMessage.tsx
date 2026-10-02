import { useEffect, type ReactNode } from 'react'

const VISIBLE_MS = 2000

interface SubWinMessageProps {
  children: ReactNode
  onDone: () => void
}

export function SubWinMessage({ children, onDone }: SubWinMessageProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [onDone])

  return <div id="subwin-message">{children}</div>
}
