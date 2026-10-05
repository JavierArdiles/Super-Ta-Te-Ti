import { useEffect, useRef } from 'react'

const supported = () => typeof window !== 'undefined' && 'Notification' in window

let   audio: AudioContext | null = null

/**
 * Pide permiso para notificar y habilita el sonido. Tiene que llamarse desde un clic:
 * sin eso los navegadores ignoran el pedido y no dejan reproducir audio
 */
export function prepareTurnAlerts() {
  if (supported() && Notification.permission === 'default') void Notification.requestPermission().catch(() => {})
  unlockAudio()
}

function unlockAudio() {
  if (audio?.state === 'running') return
  try {
    audio ??= new AudioContext()
    void audio.resume().catch(() => {})
  } catch {
    audio = null
  }
}

// Arpegio ascendente de onda cuadrada, como el "coin" de los fichines
const JINGLE: { freq: number; at: number; length: number }[] = [
  { freq: 523.25, at: 0, length: 0.07 }, // Do
  { freq: 659.25, at: 0.07, length: 0.07 }, // Mi
  { freq: 783.99, at: 0.14, length: 0.07 }, // Sol
  { freq: 1046.5, at: 0.21, length: 0.18 }, // Do agudo
]
const VOLUME = 0.25

function playJingle() {
  if (!audio || audio.state !== 'running') return
  const start = audio.currentTime + 0.02
  for (const note of JINGLE) {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'square'
    osc.frequency.value = note.freq
    gain.gain.setValueAtTime(VOLUME, start + note.at)
    gain.gain.exponentialRampToValueAtTime(0.001, start + note.at + note.length)
    osc.connect(gain).connect(audio.destination)
    osc.start(start + note.at)
    osc.stop(start + note.at + note.length)
  }
}

/** Avisa con sonido y notificación del navegador cuando pasa a ser tu turno y no estás mirando la pestaña */
export function useTurnNotification(myTurn: boolean, body: string) {
  const wasMyTurn = useRef(false)
  const notification = useRef<Notification | null>(null)

  useEffect(() => {
    const becameMyTurn = myTurn && !wasMyTurn.current
    wasMyTurn.current = myTurn

    if (!myTurn) {
      notification.current?.close()
      notification.current = null
      return
    }
    if (!becameMyTurn) return
    if (document.visibilityState === 'visible' && document.hasFocus()) return

    playJingle()
    if (!supported() || Notification.permission !== 'granted') return
    try {
      // Silenciosa para que no se pise con el sonido del juego
      const n = new Notification('¡Es tu turno!', { body, icon: '/favicon.svg', tag: 'super-ta-te-ti-turno', silent: true })
      n.onclick = () => {
        window.focus()
        n.close()
      }
      notification.current = n
    } catch {
      // Chrome en Android no deja crear notificaciones sin service worker: se juega igual sin aviso
    }
  }, [myTurn, body])

  // Si llegaste sin pasar por los botones del menú (por ejemplo, recargando en medio de una partida
  // online), el sonido se habilita con el primer clic o tecla
  useEffect(() => {
    window.addEventListener('pointerdown', unlockAudio)
    window.addEventListener('keydown', unlockAudio)
    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }
  }, [])

  // Al volver a la pestaña el aviso ya no hace falta
  useEffect(() => {
    const dismiss = () => {
      notification.current?.close()
      notification.current = null
    }
    window.addEventListener('focus', dismiss)
    return () => {
      window.removeEventListener('focus', dismiss)
      dismiss()
    }
  }, [])
}
