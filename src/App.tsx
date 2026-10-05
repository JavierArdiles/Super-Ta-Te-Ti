import { useEffect, useState } from 'react'
import { BOT_BACKGROUNDS } from './components/botArt'
import { Game } from './components/Game'
import { loadConfig, resolveAppearances, resolveFirstPlayer, resolveNames, saveConfig } from './components/gameConfig'
import { OnlineScreen } from './components/OnlineScreen'
import { Setup } from './components/Setup'
import { prepareTurnAlerts } from './components/turnNotification'
import type { OnlineIntent } from './online/useOnlineRoom'

type Screen = { name: 'setup' } | { name: 'game' } | { name: 'online'; intent: OnlineIntent }

/** Si entraste con un link de sala (?sala=K7QF), vas directo a unirte */
function initialScreen(): Screen {
  const code = new URLSearchParams(window.location.search).get('sala')?.toUpperCase()
  return code ? { name: 'online', intent: { kind: 'join', code } } : { name: 'setup' }
}

export default function App() {
  const [config, setConfig] = useState(loadConfig)
  const [screen, setScreen] = useState<Screen>(initialScreen)

  useEffect(() => saveConfig(config), [config])

  const profile = { name: config.names.X, appearance: config.appearances.X }

  const play = () => {
    if (config.mode === 'bot' || config.mode === 'online') prepareTurnAlerts()
    if (config.mode !== 'online') return setScreen({ name: 'game' })
    setScreen({
      name: 'online',
      intent: { kind: 'create', playerCount: config.onlinePlayerCount, starter: config.onlineStarter, player: profile },
    })
  }

  return (
    <>
      {config.mode === 'bot' && screen.name !== 'online' && (
        <div className="backdrop" style={{ backgroundImage: `url(${BOT_BACKGROUNDS[config.level]})` }} />
      )}
      <h1>Super Ta-Te-Ti</h1>
      {screen.name === 'setup' && <Setup config={config} onChange={setConfig} onPlay={play} />}
      {screen.name === 'game' && (
        <Game
          mode={config.mode}
          level={config.level}
          appearances={resolveAppearances(config)}
          names={resolveNames(config)}
          pickFirstPlayer={() => resolveFirstPlayer(config)}
          onExit={() => setScreen({ name: 'setup' })}
        />
      )}
      {screen.name === 'online' && (
        <OnlineScreen
          intent={screen.intent}
          profile={profile}
          onProfileChange={p =>
            setConfig({ ...config, names: { ...config.names, X: p.name }, appearances: { ...config.appearances, X: p.appearance } })
          }
          onExit={() => setScreen({ name: 'setup' })}
        />
      )}
    </>
  )
}
