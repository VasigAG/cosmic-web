import { useState } from 'react'
import { useContent } from '../../state/content'
import { Stars } from '../ui'

export default function Cinema() {
  const { films } = useContent().content
  const [sort, setSort] = useState<'rating' | 'year'>('rating')
  const list = [...films].sort((a, b) => (sort === 'rating' ? b.rating - a.rating : a.year - b.year))
  return (
    <div className="p-3">
      <div className="mb-2 flex items-center gap-2 text-lg">
        <span className="text-lavender">sort by:</span>
        {(['rating', 'year'] as const).map((s) => (
          <button key={s} onClick={() => setSort(s)} className={`px-2 ${sort === s ? 'bg-pink text-black' : 'border border-pink/50 text-pink'}`}>{s}</button>
        ))}
      </div>
      <div className="grid gap-2">
        {list.map((f, i) => (
          <article key={i} className="flex gap-3 border border-baby/40 bg-black/40 p-2">
            <div className="flex h-20 w-14 shrink-0 items-center justify-center bg-gradient-to-b from-lavender to-pink font-pixel text-[8px] text-black">{f.year}</div>
            <div>
              <h3 className="font-serif-old text-xl text-butter">{f.title}</h3>
              <div className="text-baby">dir. {f.director}</div>
              <Stars n={Math.max(0, Math.min(5, Math.round(f.rating)))} />
              <p className="text-white/80">{f.note}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
