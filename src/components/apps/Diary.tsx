import { useState } from 'react'
import { useContent } from '../../state/content'

export default function Diary() {
  const { diary } = useContent().content
  const [idx, setIdx] = useState(0)
  const e = diary[Math.min(idx, diary.length - 1)]
  return (
    <div className="flex h-full flex-col bg-[#ffe3ef] font-term text-[20px] text-[#4a2a3a]">
      <div className="flex gap-3 border-b border-[#ff9ccb] bg-[#ffd0e4] px-2 text-base">
        <span>File</span><span>Edit</span><span>Search</span><span>Help</span>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <ul className="w-36 shrink-0 overflow-auto border-r border-[#ff9ccb] bg-[#fff0f6] text-base">
          {diary.map((d, i) => (
            <li key={d.id || i}>
              <button onClick={() => setIdx(i)} className={`block w-full px-2 py-1 text-left ${d === e ? 'bg-[#ff9ccb] text-white' : 'hover:bg-[#ffd0e4]'}`}>
                <div>{d.date.slice(0, 10)}</div>
                <div className="truncate opacity-80">{d.title}</div>
              </button>
            </li>
          ))}
        </ul>
        <article className="retro-scroll flex-1 overflow-auto p-3" style={{ backgroundImage: 'repeating-linear-gradient(transparent 0 25px, #f5b5d0 25px 26px)', lineHeight: '26px' }}>
          {e ? (
            <>
              <div className="text-sm text-[#a5517a]">{e.date} · mood: {e.mood}</div>
              <h3 className="font-pixel text-[11px] leading-[26px]">{e.title}</h3>
              <p className="whitespace-pre-wrap">{e.body}</p>
            </>
          ) : <p>(empty page)</p>}
        </article>
      </div>
    </div>
  )
}
