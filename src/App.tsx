import { useCallback, useEffect, useState } from 'react'
import { useWindows } from './hooks/useWindows'
import Window from './components/Window'
import Hood from './components/Hood'
import { MatrixRain, Starfield, Ufo } from './components/Effects'
import { renderApp } from './components/apps'
import { useContent } from './state/content'
import { sfx } from './sfx'
import type { AppId } from './types'

const VISIT_KEY = 'cosmic-visits-v1'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function useVisitors(base: number) {
  const [mine, setMine] = useState(0)
  useEffect(() => {
    try {
      const n = Number(localStorage.getItem(VISIT_KEY) ?? '0') + 1
      localStorage.setItem(VISIT_KEY, String(n))
      setMine(n)
    } catch { /* storage blocked */ }
  }, [])
  return base + mine
}

export default function App() {
  const { content, ready, setFocusSlug } = useContent()
  const { site, theme, apps, quotes } = content
  const w = useWindows(apps)
  const now = useClock()
  const visitors = useVisitors(site.baseVisitors)
  const [quote, setQuote] = useState(() => quotes[Math.floor(Math.random() * Math.max(1, quotes.length))] ?? '')
  const [sound, setSound] = useState(false)
  const [secretUnlocked, setSecretUnlocked] = useState(false)
  const [clicks, setClicks] = useState(0)
  const [aliasClicks, setAliasClicks] = useState(0)
  const [hood, setHood] = useState(false)

  const open = useCallback((id: AppId) => { sfx.open(); w.open(id) }, [w])
  const unlock = useCallback(() => {
    setSecretUnlocked(true)
    sfx.beep(1040, 120, 'sine', 0.05)
    w.open('secret')
  }, [w])

  // rotating quote
  useEffect(() => {
    const id = window.setInterval(() => setQuote(quotes[Math.floor(Math.random() * Math.max(1, quotes.length))] ?? ''), 12000)
    return () => clearInterval(id)
  }, [quotes])

  // Cmd/Ctrl + K opens the Hood
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setHood((h) => !h)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // type the secret word anywhere to unlock
  useEffect(() => {
    let buf = ''
    const code = site.secretCode.toLowerCase()
    if (!code) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea') || e.metaKey || e.ctrlKey) return
      buf = (buf + e.key.toLowerCase()).slice(-code.length)
      if (buf === code) unlock()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [unlock, site.secretCode])

  // 5 taps on the visitor counter = secret; 5 taps on the alias = Hood (phone-friendly)
  useEffect(() => { if (clicks >= 5) { unlock(); setClicks(0) } }, [clicks, unlock])
  useEffect(() => { if (aliasClicks >= 5) { setHood(true); setAliasClicks(0) } }, [aliasClicks])

  // deep link: #/blog/some-slug opens the blog on that post
  useEffect(() => {
    if (!ready) return
    const m = /^#\/blog\/(.+)$/.exec(location.hash)
    if (m) { setFocusSlug(decodeURIComponent(m[1])); w.open('blog') }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center bg-space font-pixel text-[10px] text-[#7dff9b]">
        booting<span className="blink">_</span>
      </div>
    )
  }

  const visible = apps.filter((a) => (a.id === 'secret' ? secretUnlocked : !a.hidden) && a.id !== 'sitemap')
  const randomPage = () => {
    const pool = apps.filter((a) => !a.hidden)
    if (pool.length) open(pool[Math.floor(Math.random() * pool.length)].id)
  }
  const starColors = [theme.pink, theme.baby, theme.butter, '#ffffff']

  return (
    <div
      className={`${theme.crt ? 'crt ' : ''}relative h-full w-full overflow-hidden bg-space`}
      style={theme.wallpaper ? { backgroundImage: `url(${JSON.stringify(theme.wallpaper)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      <Starfield count={theme.stars} decor={theme.decor} colors={starColors} />
      {theme.ufo && <Ufo />}

      {/* top status bar */}
      <header className="absolute inset-x-0 top-0 z-[8000] flex h-7 items-center gap-3 border-b border-lavender/40 bg-black/80 px-2 font-pixel text-[9px] text-pink">
        <button onClick={() => setAliasClicks((c) => c + 1)} className="shrink-0 text-butter" aria-label="Site name">✦ {site.alias}</button>
        <div className="hidden min-w-0 flex-1 overflow-hidden text-baby sm:block"><span className="marquee">{site.tagline} &nbsp;•&nbsp; {site.tagline}</span></div>
        <div className="flex-1 sm:hidden" />
        <button onClick={randomPage} className="shrink-0 border border-pink/60 px-1 hover:bg-pink/20" aria-label="Open a random page">🎲 random</button>
        <button
          onClick={() => { const v = !sound; setSound(v); sfx.set(v); if (v) sfx.beep(880, 80) }}
          aria-pressed={sound}
          aria-label="Toggle sound effects"
          className="shrink-0 border border-baby/60 px-1 text-baby hover:bg-baby/20"
        >{sound ? '🔊' : '🔇'}</button>
        <span className="shrink-0 text-[#7dff9b]"><span className="blink">●</span> online</span>
        <time className="shrink-0 text-white" dateTime={now.toISOString()}>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</time>
      </header>

      {/* desktop icons */}
      <nav aria-label="Desktop" className="absolute bottom-12 left-2 top-9 z-[2] flex flex-col flex-wrap content-start gap-1">
        {visible.map((a) => (
          <button key={a.id} onClick={() => open(a.id)} className="group flex w-[78px] flex-col items-center gap-1 p-1 text-center focus:outline-dashed focus:outline-1 focus:outline-pink">
            <span className="text-3xl group-hover:scale-110" style={{ filter: 'drop-shadow(0 0 4px rgba(205,180,255,.7))' }}>{a.icon}</span>
            <span className="bg-black/50 px-1 font-term text-base leading-4 text-white group-hover:bg-pink group-hover:text-black">{a.label}</span>
          </button>
        ))}
      </nav>

      {/* desktop widgets */}
      <aside className="absolute bottom-16 right-3 z-[2] hidden w-60 md:block">
        <div className="bevel-out bg-silver p-1 text-black">
          <div className="title-bar px-1 font-pixel text-[8px] text-white">thought_of_the_moment.txt</div>
          <div className="relative mt-1 h-28 overflow-hidden bg-black">
            {theme.matrixRain && <MatrixRain className="absolute inset-0 h-full w-full opacity-40" color={theme.matrix} />}
            <p className="relative z-10 p-2 font-serif-old text-lg italic text-pink">“{quote}”</p>
          </div>
        </div>
        <button onClick={() => setClicks((c) => c + 1)} className="mt-2 block w-full bg-black/70 py-1 text-center font-pixel text-[8px] text-butter" aria-label="Visitor counter">
          You are visitor #{String(visitors).padStart(6, '0')}
        </button>
      </aside>

      <p className="pointer-events-none absolute inset-x-0 bottom-10 z-[2] px-2 text-center font-term text-base text-white/50 md:hidden">{quote}</p>
      <p className="pointer-events-none absolute bottom-10 left-1/2 z-[2] hidden -translate-x-1/2 font-term text-base text-white/40 md:block">{site.footer}</p>

      {/* windows */}
      {w.wins.map((win) => {
        const def = apps.find((a) => a.id === win.appId)
        if (!def) return null
        return (
          <Window
            key={win.key}
            win={win}
            title={`${def.icon} ${def.title}`}
            active={win.key === w.topKey}
            onFocus={() => w.focus(win.key)}
            onClose={() => { sfx.close(); w.close(win.key) }}
            onMinimize={() => w.minimize(win.key)}
            onToggleMax={() => w.toggleMax(win.key)}
            onMove={(x, y) => w.move(win.key, x, y)}
            onResize={(nw, nh) => w.resize(win.key, nw, nh)}
          >
            {renderApp(def, open)}
          </Window>
        )
      })}

      {/* taskbar */}
      <footer className="bevel-out absolute inset-x-0 bottom-0 z-[8000] flex h-9 items-center gap-1 bg-silver px-1 text-black">
        <button onClick={() => open('sitemap')} className="bevel-out flex items-center gap-1 bg-silver px-2 font-pixel text-[9px] active:bevel-in">
          <span className="text-pink">✦</span> Start
        </button>
        <div className="mx-1 h-6 w-px bg-gray-500" />
        <div className="retro-scroll flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {w.wins.map((win) => {
            const def = apps.find((a) => a.id === win.appId)
            if (!def) return null
            const active = win.key === w.topKey
            return (
              <button
                key={win.key}
                onClick={() => (active ? w.minimize(win.key) : w.focus(win.key))}
                className={`${active ? 'bevel-in bg-white/70' : 'bevel-out bg-silver'} flex w-28 shrink-0 items-center gap-1 truncate px-1 font-term text-base`}
              >
                <span>{def.icon}</span><span className="truncate">{def.label}</span>
              </button>
            )
          })}
        </div>
        <div className="bevel-in hidden px-2 font-term text-base sm:block">{now.toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
      </footer>

      {hood && <Hood onClose={() => setHood(false)} />}
    </div>
  )
}
