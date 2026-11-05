import { useState } from 'react'
import { useContent } from '../../state/content'
import { H } from '../ui'

export default function MathDungeon() {
  const { notes } = useContent().content
  const [sel, setSel] = useState<string>(notes[0]?.id ?? '')
  const byId = Object.fromEntries(notes.map((n) => [n.id, n]))
  const cur = byId[sel] ?? notes[0]
  if (!cur) return <p className="p-3 text-white/60">No notes yet. Add some in the Hood.</p>
  const links = cur.links.filter((l) => byId[l])
  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-[240px] flex-1 bg-[radial-gradient(ellipse_at_center,#1b1030,#080808)]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {notes.flatMap((n) =>
            n.links.filter((l) => byId[l] && n.id < l).map((l) => (
              <line key={`${n.id}-${l}`} x1={n.x} y1={n.y} x2={byId[l].x} y2={byId[l].y}
                stroke={n.id === cur.id || l === cur.id ? '#ffb7d5' : '#cdb4ff'} strokeOpacity={n.id === cur.id || l === cur.id ? 0.9 : 0.35}
                strokeWidth="0.35" vectorEffect="non-scaling-stroke" />
            )),
          )}
        </svg>
        {notes.map((n, i) => (
          <button key={`${n.id}-${i}`} onClick={() => setSel(n.id)} aria-pressed={n.id === cur.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
            <span className={`twinkle block text-2xl ${n.id === cur.id ? 'text-pink' : 'text-butter'}`}>✦</span>
            <span className="block max-w-[90px] bg-black/60 px-1 text-[15px] leading-4 text-baby">{n.title}</span>
          </button>
        ))}
      </div>
      <div className="border-t-2 border-lavender/50 bg-black/60 p-3">
        <H>{cur.title}</H>
        <p className="font-serif-old text-lg text-white/90">{cur.body}</p>
        {links.length > 0 && (
          <p className="mt-1 text-baby">
            linked to:{' '}
            {links.map((l) => <button key={l} className="mr-2 underline" onClick={() => setSel(l)}>{byId[l].title}</button>)}
          </p>
        )}
      </div>
    </div>
  )
}
