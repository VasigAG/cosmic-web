import { useContent } from '../../state/content'
import { Badge, H } from '../ui'

const okUrl = (u: string) => /^https?:\/\//i.test(u)

export default function Links() {
  const { webring, badges } = useContent().content
  const rand = () => {
    const pool = webring.filter((l) => okUrl(l.url))
    if (pool.length) window.open(pool[Math.floor(Math.random() * pool.length)].url, '_blank', 'noopener,noreferrer')
  }
  return (
    <div className="p-3">
      <H>~ WEBRING ~</H>
      <div className="mb-3 flex items-center justify-center gap-3 text-2xl text-pink" aria-label="Webring navigation">
        <span className="text-butter">✦</span>
        <button onClick={rand} className="underline">random site</button>
        <span className="text-butter">✦</span>
      </div>
      <ul className="space-y-2">
        {webring.map((l, i) => (
          <li key={i} className="border border-baby/40 p-2">
            {okUrl(l.url)
              ? <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-xl text-baby underline">{l.name}</a>
              : <span className="text-xl text-baby">{l.name}</span>}
            <div className="text-white/70">{l.blurb}</div>
          </li>
        ))}
      </ul>
      <H color="text-lavender">88x31 COLLECTION</H>
      <div className="flex flex-wrap gap-2">{badges.map((b, i) => <Badge key={i}>{b}</Badge>)}</div>
    </div>
  )
}
