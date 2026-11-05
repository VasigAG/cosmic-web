import { useState } from 'react'
import { useContent } from '../../state/content'
import { Btn } from '../ui'

const okUrl = (u: string) => /^https?:\/\//i.test(u)

export default function Explorer() {
  const { explorerSites } = useContent().content
  const [q, setQ] = useState('')
  const list = explorerSites.filter((s) => (s.name + s.blurb).toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="flex h-full flex-col bg-white text-black">
      <div className="flex items-center gap-1 border-b border-gray-400 bg-silver p-1">
        <Btn onClick={() => setQ('')}>⌂</Btn>
        <div className="bevel-in flex-1 bg-white px-1 text-base">
          <label className="sr-only" htmlFor="ie-search">Filter bookmarks</label>
          <input id="ie-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="http://filter-the-weird-web.com" className="w-full bg-transparent outline-none" />
        </div>
      </div>
      <div className="construction h-2" aria-hidden />
      <div className="retro-scroll flex-1 overflow-auto p-3">
        <h2 className="font-serif-old text-2xl text-[#0000ee]">Favourites &amp; Weird Corners</h2>
        <p className="mb-2 text-base text-gray-600">Last updated: whenever I remember to.</p>
        <ul className="space-y-2">
          {list.map((s, i) => (
            <li key={i} className="border-b border-dotted border-gray-400 pb-1">
              {okUrl(s.url)
                ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xl text-[#0000ee] underline visited:text-[#551a8b]">{s.name}</a>
                : <span className="text-xl text-[#0000ee]">{s.name}</span>}
              <div className="text-base text-gray-700">{s.blurb}</div>
            </li>
          ))}
          {list.length === 0 && <li className="text-gray-500">Nothing here. The web is big, though.</li>}
        </ul>
      </div>
    </div>
  )
}
