import { useContent } from '../../state/content'
import Markdown from '../../lib/markdown'
import type { AppId } from '../../types'
import { H } from '../ui'

export function RecycleBin() {
  const { recycleBin } = useContent().content
  return (
    <div className="p-3">
      <H>DELETED THOUGHTS</H>
      <ul className="space-y-1 text-lg">
        {recycleBin.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-white/70"><span>📄</span><span className="line-through decoration-pink/60">{f}</span></li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-white/50">Nothing in here can be restored. That is the point.</p>
    </div>
  )
}

export function SiteMap({ open }: { open: (id: AppId) => void }) {
  const { apps } = useContent().content
  return (
    <div className="p-3">
      <H>SITE MAP ✦ chaotic but navigable</H>
      <ul className="grid grid-cols-2 gap-2">
        {apps.filter((a) => !a.hidden).map((a, i) => (
          <li key={a.id} style={{ transform: `rotate(${(i % 3 - 1) * 1.5}deg)` }}>
            <button onClick={() => open(a.id)} className="bevel-out w-full bg-silver p-2 text-left text-lg text-black">
              <span className="mr-1">{a.icon}</span>{a.label}
            </button>
          </li>
        ))}
        <li className="construction col-span-2 p-1 text-center font-pixel text-[8px] text-black">🚧 UNDER CONSTRUCTION 🚧 — more rooms soon</li>
      </ul>
      <p className="mt-3 text-sm text-white/50">Psst: one door is not on this map.</p>
    </div>
  )
}

/** Custom pages you create in the Hood are just markdown windows. */
export function Page({ source }: { source: string }) {
  return <div className="p-3"><Markdown source={source} /></div>
}
