import { useEffect, useState } from 'react'
import { useContent } from '../../state/content'
import { sfx } from '../../sfx'

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export default function Music() {
  const { tracks, musicNotes } = useContent().content
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  const [bars, setBars] = useState<number[]>(Array(24).fill(2))
  const i = Math.min(idx, Math.max(0, tracks.length - 1))
  const t = tracks[i]
  const len = t ? Math.max(1, t.length) : 1

  useEffect(() => {
    if (!playing) { setBars(Array(24).fill(2)); return }
    const id = window.setInterval(() => {
      setPos((p) => p + 1)
      setBars(Array.from({ length: 24 }, () => 2 + Math.random() * 40))
    }, 500)
    return () => clearInterval(id)
  }, [playing])

  useEffect(() => {
    if (pos >= len && tracks.length) { setPos(0); setIdx((n) => (n + 1) % tracks.length) }
  }, [pos, len, tracks.length])

  const go = (n: number) => { if (tracks.length) { setIdx((n + tracks.length) % tracks.length); setPos(0) } }

  return (
    <div className="bg-[#1b1b24] p-2 font-term text-[#7dff9b]">
      <div className="bevel-in bg-black p-2">
        <div className="truncate text-lg">{t ? `${i + 1}. ${t.artist} - ${t.title}` : 'no tracks loaded'}</div>
        <div className="flex h-12 items-end gap-[2px]" aria-hidden>
          {bars.map((h, n) => <i key={n} className="block w-2 bg-gradient-to-t from-[#7dff9b] to-butter" style={{ height: h }} />)}
        </div>
        <div className="flex justify-between text-sm"><span>{fmt(pos)}</span><span>{fmt(len)}</span></div>
        <input aria-label="Seek" type="range" min={0} max={len} value={Math.min(pos, len)} onChange={(e) => setPos(+e.target.value)} className="w-full accent-pink" />
      </div>
      <div className="my-2 flex justify-center gap-1">
        {([['⏮', () => go(i - 1)], [playing ? '⏸' : '▶', () => setPlaying((p) => !p)], ['⏹', () => { setPlaying(false); setPos(0) }], ['⏭', () => go(i + 1)]] as [string, () => void][]).map(([l, f]) => (
          <button key={l} onClick={() => { sfx.click(); f() }} className="bevel-out w-10 bg-silver py-1 text-lg text-black active:bevel-in">{l}</button>
        ))}
      </div>
      <ul className="bevel-in bg-black">
        {tracks.map((x, n) => (
          <li key={n}>
            <button onClick={() => { go(n); setPlaying(true) }} className={`flex w-full justify-between px-2 text-left ${n === i ? 'bg-[#303050] text-white' : ''}`}>
              <span className="truncate">{n + 1}. {x.title}</span><span>{fmt(x.length)}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 text-sm text-baby">
        <div className="mb-1 text-butter">♪ {musicNotes.currently}</div>
        <div>Favourite albums:</div>
        <ul className="list-['•_'] pl-4">{musicNotes.albums.map((a, n) => <li key={n}>{a}</li>)}</ul>
        <div className="mt-1 text-white/50">(Player is a visual toy; no audio is played.)</div>
      </div>
    </div>
  )
}
