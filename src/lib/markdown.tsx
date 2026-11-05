import type { ReactNode } from 'react'

/* A small, dependency-free markdown renderer. It builds React elements (never raw HTML),
   and only allows http(s), mailto, hash and relative URLs, so post content cannot inject scripts. */

const safeUrl = (u: string) => /^(https?:\/\/|mailto:|#|\/)/i.test(u.trim())

const INLINE = /(`[^`\n]+`)|(!\[[^\]\n]*\]\([^)\s]+\))|(\[[^\]\n]+\]\([^)\s]+\))|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(~~[^~\n]+~~)/g

function inline(text: string, keyBase = ''): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let i = 0
  for (const m of text.matchAll(INLINE)) {
    const idx = m.index ?? 0
    if (idx > last) out.push(text.slice(last, idx))
    const tok = m[0]
    const key = `${keyBase}${i++}`
    if (tok.startsWith('`')) {
      out.push(<code key={key} className="bg-white/10 px-1 text-butter">{tok.slice(1, -1)}</code>)
    } else if (tok.startsWith('![')) {
      const mm = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(tok)!
      out.push(safeUrl(mm[2]) && !mm[2].startsWith('mailto:')
        ? <img key={key} src={mm[2]} alt={mm[1]} loading="lazy" className="my-2 max-w-full border border-lavender/40" />
        : mm[1])
    } else if (tok.startsWith('[')) {
      const mm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok)!
      out.push(safeUrl(mm[2])
        ? <a key={key} href={mm[2]} target="_blank" rel="noopener noreferrer" className="text-baby underline">{inline(mm[1], key)}</a>
        : mm[1])
    } else if (tok.startsWith('**')) {
      out.push(<strong key={key} className="text-butter">{inline(tok.slice(2, -2), key)}</strong>)
    } else if (tok.startsWith('~~')) {
      out.push(<s key={key}>{tok.slice(2, -2)}</s>)
    } else {
      out.push(<em key={key} className="text-pink">{inline(tok.slice(1, -1), key)}</em>)
    }
    last = idx + tok.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export default function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let k = 0
  const isBlockStart = (l: string) => /^(#{1,3}\s|>\s?|[-*]\s|\d+\.\s|```|---+\s*$)/.test(l)

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }

    if (line.startsWith('```')) {
      const buf: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++])
      i++
      blocks.push(<pre key={k++} className="retro-scroll my-2 overflow-auto bg-black p-2 text-base text-[#7dff9b]"><code>{buf.join('\n')}</code></pre>)
      continue
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(line)
    if (h) {
      const lvl = h[1].length
      const cls = lvl === 1 ? 'mb-2 mt-3 font-pixel text-[13px] leading-6 text-pink' : lvl === 2 ? 'mb-1 mt-3 font-pixel text-[11px] leading-5 text-baby' : 'mb-1 mt-2 font-serif-old text-xl text-lavender'
      blocks.push(lvl === 1 ? <h1 key={k++} className={cls}>{inline(h[2])}</h1> : lvl === 2 ? <h2 key={k++} className={cls}>{inline(h[2])}</h2> : <h3 key={k++} className={cls}>{inline(h[2])}</h3>)
      i++
      continue
    }
    if (/^---+\s*$/.test(line)) { blocks.push(<hr key={k++} className="my-3 border-0 border-t border-dashed border-lavender/50" />); i++; continue }
    if (/^>\s?/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''))
      blocks.push(<blockquote key={k++} className="my-2 border-l-4 border-pink/60 pl-3 font-serif-old italic text-white/80">{inline(buf.join(' '))}</blockquote>)
      continue
    }
    if (/^[-*]\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s/.test(lines[i])) items.push(lines[i++].replace(/^[-*]\s/, ''))
      blocks.push(<ul key={k++} className="my-2 list-['✦_'] pl-5">{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ul>)
      continue
    }
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) items.push(lines[i++].replace(/^\d+\.\s/, ''))
      blocks.push(<ol key={k++} className="my-2 list-decimal pl-6">{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ol>)
      continue
    }
    const buf: string[] = []
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) buf.push(lines[i++])
    if (buf.length === 0) { buf.push(lines[i++]) } // safety: always advance
    blocks.push(<p key={k++} className="my-2 break-words">{inline(buf.join(' '))}</p>)
  }
  return <div className="text-[19px] leading-snug text-white/90">{blocks}</div>
}
