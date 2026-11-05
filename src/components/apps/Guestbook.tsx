import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { guestSeed } from '../../data/content'
import { hasBackend, supabase } from '../../lib/supabase'
import type { GuestMsg } from '../../types'
import { Btn, H } from '../ui'

const KEY = 'cosmic-guestbook-v1'

function loadLocal(): GuestMsg[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as GuestMsg[]) : []
  } catch { return [] }
}

export default function Guestbook() {
  const [entries, setEntries] = useState<GuestMsg[]>(hasBackend ? [] : [...loadLocal(), ...guestSeed])
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [trap, setTrap] = useState('') // honeypot: real people never fill this in
  const [note, setNote] = useState('')
  const [lastSent, setLastSent] = useState(0)

  useEffect(() => {
    if (!supabase) return
    supabase.from('guestbook').select('name,message,created_at').eq('approved', true).order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => {
        if (data) setEntries(data.map((r) => ({ name: r.name as string, msg: r.message as string, date: (r.created_at as string).slice(0, 10) })))
      })
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const clean = { name: name.trim().slice(0, 24) || 'anon', msg: msg.trim().slice(0, 280) }
    if (!clean.msg || trap) return
    if (Date.now() - lastSent < 30000) { setNote('Slow down, traveler. Try again in a moment.'); return }
    setLastSent(Date.now())

    if (supabase) {
      const { error } = await supabase.from('guestbook').insert({ name: clean.name, message: clean.msg })
      setNote(error ? 'Could not send that. Try again later.' : 'Thanks! Your message will appear once it is approved. ✦')
    } else {
      const entry: GuestMsg = { ...clean, date: new Date().toISOString().slice(0, 10) }
      const mine = [entry, ...loadLocal()]
      try { localStorage.setItem(KEY, JSON.stringify(mine)) } catch { /* storage blocked */ }
      setEntries([entry, ...entries])
      setNote('Saved in your browser only (no backend connected).')
    }
    setMsg('')
  }

  return (
    <div className="p-3">
      <H>SIGN MY GUESTBOOK!!</H>
      <form onSubmit={submit} className="bevel-out mb-3 bg-silver p-2 text-black">
        <label className="block text-base">Name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} className="bevel-in mt-0.5 block w-full bg-white px-1 text-lg" />
        </label>
        <label className="mt-1 block text-base">Message
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={280} rows={3} required className="bevel-in mt-0.5 block w-full bg-white px-1 text-lg" />
        </label>
        <input aria-hidden tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" name="website" />
        <div className="mt-2 flex gap-2"><Btn type="submit">Sign ✍</Btn><Btn type="button" onClick={() => { setName(''); setMsg('') }}>Reset</Btn></div>
        {note && <p className="mt-1 text-base text-[#6a2a8a]" role="status">{note}</p>}
      </form>
      <ul className="space-y-2">
        {entries.map((g, i) => (
          <li key={i} className="border border-lavender/40 bg-black/40 p-2">
            <div className="text-baby">{g.name} <span className="text-white/40">· {g.date}</span></div>
            <div className="break-words text-white/90">{g.msg}</div>
          </li>
        ))}
        {entries.length === 0 && <li className="text-white/50">No entries yet. Be the first!</li>}
      </ul>
    </div>
  )
}
