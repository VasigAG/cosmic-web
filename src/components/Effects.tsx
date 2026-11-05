import { useEffect, useMemo, useRef, useState } from 'react'

const SLOTS = [
  'right-[6%] top-[14%] text-5xl',
  'bottom-[18%] left-[8%] text-2xl',
  'left-[45%] top-[8%] text-xl',
  'right-[30%] bottom-[30%] text-3xl',
  'left-[22%] top-[40%] text-2xl',
]

/** Twinkling pixel stars + floating decorations (count and emoji come from the theme). */
export function Starfield({ count, decor, colors }: { count: number; decor: string[]; colors: string[] }) {
  const stars = useMemo(
    () => Array.from({ length: Math.max(0, Math.min(400, count)) }, () => ({
      x: Math.random() * 100, y: Math.random() * 100,
      s: Math.random() > 0.85 ? 3 : 2, d: Math.random() * 3,
      c: Math.floor(Math.random() * 4),
    })),
    [count],
  )
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {stars.map((s, i) => (
        <i key={i} className="twinkle absolute block" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, background: colors[s.c % colors.length], animationDelay: `${s.d}s` }} />
      ))}
      {decor.slice(0, SLOTS.length).map((d, i) => (
        <span key={i} className={`floaty absolute opacity-80 ${SLOTS[i]}`} style={{ animationDelay: `${i * 1.2}s`, filter: 'drop-shadow(0 0 8px var(--color-lavender))' }}>{d}</span>
      ))}
    </div>
  )
}

/** Falling glyphs on a canvas. */
export function MatrixRain({ className = '', color = '#7dff9b' }: { className?: string; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const resize = () => { c.width = c.clientWidth; c.height = c.clientHeight }
    resize()
    const size = 14
    const glyphs = 'ｱｲｳｴｵｶｷｸｹｺ0123456789ΣΩπ∂∇ψ⟩'
    let drops: number[] = Array(Math.ceil(c.width / size)).fill(0).map(() => Math.random() * -40)
    const tick = () => {
      if (drops.length !== Math.ceil(c.width / size)) drops = Array(Math.ceil(c.width / size)).fill(0)
      ctx.fillStyle = 'rgba(8,8,8,0.12)'
      ctx.fillRect(0, 0, c.width, c.height)
      ctx.fillStyle = color
      ctx.font = `${size}px monospace`
      drops.forEach((y, i) => {
        ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * size, y * size)
        drops[i] = y * size > c.height && Math.random() > 0.97 ? 0 : y + 1
      })
    }
    const id = reduce ? 0 : window.setInterval(tick, 70)
    if (reduce) { ctx.fillStyle = '#080808'; ctx.fillRect(0, 0, c.width, c.height) }
    window.addEventListener('resize', resize)
    return () => { clearInterval(id); window.removeEventListener('resize', resize) }
  }, [color])
  return <canvas ref={ref} className={className} aria-hidden />
}

/** A UFO that wanders across the screen every so often. */
export function Ufo() {
  const [flying, setFlying] = useState(false)
  const [top, setTop] = useState(20)
  useEffect(() => {
    const timers: number[] = []
    const schedule = () => {
      timers.push(window.setTimeout(() => {
        setTop(8 + Math.random() * 55)
        setFlying(true)
        timers.push(window.setTimeout(() => setFlying(false), 9000))
        schedule()
      }, 20000 + Math.random() * 25000))
    }
    schedule()
    timers.push(window.setTimeout(() => setFlying(true), 4000))
    timers.push(window.setTimeout(() => setFlying(false), 13000))
    return () => timers.forEach(clearTimeout)
  }, [])
  if (!flying) return null
  return (
    <div className="pointer-events-none absolute left-0 z-[5] text-4xl" style={{ top: `${top}%`, animation: 'ufo-fly 9s linear forwards' }} aria-hidden>
      <span style={{ filter: 'drop-shadow(0 0 10px var(--color-baby))' }}>🛸</span>
    </div>
  )
}
