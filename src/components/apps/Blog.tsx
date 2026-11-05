import { useEffect, useState } from 'react'
import Markdown from '../../lib/markdown'
import { useContent } from '../../state/content'
import { Btn } from '../ui'

const fmt = (iso: string) => iso.slice(0, 10)

export default function Blog() {
  const { posts, focusSlug, setFocusSlug } = useContent()
  const [slug, setSlug] = useState<string | null>(focusSlug)
  const [copied, setCopied] = useState(false)

  useEffect(() => { if (focusSlug) { setSlug(focusSlug); setFocusSlug(null) } }, [focusSlug, setFocusSlug])

  const post = posts.find((p) => p.slug === slug)

  if (post) {
    const link = `${location.origin}${location.pathname}#/blog/${post.slug}`
    return (
      <article className="p-3">
        <Btn onClick={() => { setSlug(null); history.replaceState(null, '', location.pathname) }}>◀ all posts</Btn>
        <h1 className="mt-3 font-pixel text-[13px] leading-6 text-pink">{post.title}</h1>
        <div className="mb-2 text-baby">{fmt(post.created_at)}{post.tags.length > 0 && ` · ${post.tags.map((t) => `#${t}`).join(' ')}`}</div>
        <Markdown source={post.body} />
        <div className="mt-4 border-t border-dashed border-lavender/40 pt-2">
          <Btn onClick={() => { history.replaceState(null, '', `#/blog/${post.slug}`); navigator.clipboard?.writeText(link).then(() => setCopied(true)).catch(() => undefined) }}>
            {copied ? 'link copied ✓' : 'copy link'}
          </Btn>
        </div>
      </article>
    )
  }

  return (
    <div className="p-3">
      <h2 className="mb-2 font-pixel text-[11px] text-pink">TRANSMISSIONS</h2>
      {posts.length === 0 && <p className="text-white/60">No transmissions yet. Check back soon.</p>}
      <ul className="space-y-2">
        {posts.map((p) => (
          <li key={p.id}>
            <button onClick={() => setSlug(p.slug)} className="block w-full border border-baby/40 bg-black/40 p-2 text-left hover:bg-white/5">
              <div className="font-serif-old text-xl text-butter">{p.title}</div>
              <div className="text-baby">{fmt(p.created_at)}{p.tags.length > 0 && ` · ${p.tags.map((t) => `#${t}`).join(' ')}`}</div>
              <div className="truncate text-white/60">{p.body.replace(/[#>*`_\-[\]]/g, '').slice(0, 110)}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
