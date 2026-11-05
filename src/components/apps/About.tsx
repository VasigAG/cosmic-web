import { useContent } from '../../state/content'
import { H, Divider } from '../ui'

const avatar = [
  '..PPPPPP..', '.PPPPPPPP.', 'PPYYPPYYPP', 'PPYKPPYKPP', 'PPPPPPPPPP', 'PPPRPPRPPP', '.PPPMMPPP.', '..BBBBBB..', '.BBBBBBBB.', 'BB.BBBB.BB',
]
const palette: Record<string, string> = { P: '#ffb7d5', Y: '#fff', K: '#080808', R: '#ff7aa8', M: '#c2528a', B: '#a8d8ff' }

export default function About() {
  const { about } = useContent().content
  return (
    <div className="p-3 text-[19px] leading-snug">
      <div className="flex gap-3">
        <svg viewBox="0 0 10 10" className="pixelated bevel-in h-24 w-24 shrink-0 bg-charcoal" shapeRendering="crispEdges" role="img" aria-label="Pixel avatar">
          {avatar.flatMap((row, y) => [...row].map((c, x) => (c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={palette[c]} />)))}
        </svg>
        <div>
          <div className="font-pixel text-[12px] text-baby">{about.name}</div>
          <div className="text-lavender">{about.pronouns} · {about.location}</div>
          <div className="mt-1 text-butter blink">▮ online</div>
        </div>
      </div>
      <Divider />
      <p className="whitespace-pre-wrap font-serif-old text-xl italic text-white/90">{about.bio}</p>
      <Divider />
      <H>BELIEFS</H>
      <ul className="list-['✦_'] pl-5">{about.beliefs.map((b, i) => <li key={i}>{b}</li>)}</ul>
      <H color="text-baby">AMBITIONS</H>
      <ul className="list-['➤_'] pl-5">{about.ambitions.map((b, i) => <li key={i}>{b}</li>)}</ul>
      <Divider />
      <H color="text-butter">INTERESTS</H>
      <div className="flex flex-wrap gap-1">
        {about.interests.map((i, n) => <span key={n} className="border border-lavender/50 bg-lavender/10 px-2 text-lavender">{i}</span>)}
      </div>
      <Divider />
      <H>TIMELINE</H>
      <ol className="border-l-2 border-pink/50 pl-3">
        {about.timeline.map((t, i) => (
          <li key={i} className="mb-1"><span className="font-pixel text-[9px] text-butter">{t.year}</span> {t.text}</li>
        ))}
      </ol>
    </div>
  )
}
