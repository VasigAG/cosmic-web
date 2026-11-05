import { useState } from 'react'
import { useContent } from '../../state/content'
import { H } from '../ui'

const statusStyle: Record<string, string> = {
  running: 'text-[#7dff9b]', paused: 'text-butter', idea: 'text-baby', done: 'text-pink',
}

export default function Brain() {
  const { projects, researchNotes } = useContent().content
  const [sel, setSel] = useState(0)
  const p = projects[Math.min(sel, projects.length - 1)]
  return (
    <div className="p-3 font-term text-[19px] text-[#7dff9b]">
      <div className="mb-2 text-sm text-[#7dff9b]/70">brain_lab@stardust:~$ ls experiments/</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {projects.map((x, i) => (
          <button key={i} onClick={() => setSel(i)} className={`border p-2 text-left ${x === p ? 'border-pink bg-pink/10' : 'border-[#7dff9b]/40 hover:bg-white/5'}`}>
            <div className="flex justify-between gap-2">
              <span className="truncate text-white">{x.name}</span>
              <span className={`${statusStyle[x.status] ?? 'text-white'} ${x.status === 'running' ? 'blink' : ''}`}>● {x.status}</span>
            </div>
          </button>
        ))}
      </div>
      {p && (
        <div className="mt-3 border border-pink/60 bg-black/40 p-3">
          <H>{p.name}</H>
          <p className="text-white/90">{p.blurb}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-baby">{p.tags.map((t, i) => <span key={i}>#{t}</span>)}</div>
        </div>
      )}
      <div className="mt-4">
        <H color="text-lavender">LAB NOTEBOOK</H>
        {researchNotes.map((n, i) => (
          <p key={i} className="mb-1 text-white/85"><span className="text-butter">[{n.date}]</span> {n.text}</p>
        ))}
        <span className="blink">█</span>
      </div>
    </div>
  )
}
