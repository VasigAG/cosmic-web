import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { defaultContent, samplePosts } from '../data/defaults'
import type { Content } from '../data/defaults'
import { hasBackend, supabase } from '../lib/supabase'
import type { Post } from '../types'

/** Defaults provide the shape; saved data overrides matching keys. Arrays are replaced wholesale. */
export function deepMerge<T>(base: T, patch: unknown): T {
  if (Array.isArray(base)) return (Array.isArray(patch) ? patch : base) as T
  if (base && typeof base === 'object') {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
    if (patch && typeof patch === 'object' && !Array.isArray(patch)) {
      for (const k of Object.keys(base as object)) {
        if (k in (patch as object)) out[k] = deepMerge((base as Record<string, unknown>)[k], (patch as Record<string, unknown>)[k])
      }
    }
    return out as T
  }
  return (typeof patch === typeof base ? patch : base) as T
}

interface Ctx {
  content: Content
  posts: Post[] // published posts only
  ready: boolean
  /** live-preview setters used by the Hood */
  setContent: (c: Content) => void
  setPosts: (p: Post[]) => void
  focusSlug: string | null
  setFocusSlug: (s: string | null) => void
}

const ContentCtx = createContext<Ctx | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content>(defaultContent)
  const [posts, setPosts] = useState<Post[]>(hasBackend ? [] : samplePosts)
  const [ready, setReady] = useState(!hasBackend)
  const [focusSlug, setFocusSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    let alive = true
    const timeout = window.setTimeout(() => alive && setReady(true), 5000) // never trap visitors on the boot screen
    ;(async () => {
      try {
        const [cfg, ps] = await Promise.all([
          supabase.from('site_config').select('data').eq('id', 1).maybeSingle(),
          supabase.from('posts').select('*').eq('published', true).order('created_at', { ascending: false }),
        ])
        if (!alive) return
        if (cfg.data?.data) setContent(deepMerge(defaultContent, cfg.data.data))
        if (ps.data) setPosts(ps.data as Post[])
      } catch { /* offline or misconfigured: fall back to defaults */ }
      if (alive) setReady(true)
    })()
    return () => { alive = false; clearTimeout(timeout) }
  }, [])

  // ---- apply theme to the page ----
  const t = content.theme
  useEffect(() => {
    const r = document.documentElement.style
    const map: Record<string, string> = {
      '--color-space': t.space, '--color-charcoal': t.charcoal, '--color-pink': t.pink, '--color-lavender': t.lavender,
      '--color-baby': t.baby, '--color-butter': t.butter, '--color-silver': t.silver,
      '--tb1': t.tb1, '--tb2': t.tb2, '--tb3': t.tb3,
    }
    for (const [k, v] of Object.entries(map)) if (v) r.setProperty(k, v)
    r.setProperty('--font-pixel', `"${t.fontPixel}", monospace`)
    r.setProperty('--font-term', `"${t.fontTerm}", monospace`)
    r.setProperty('--font-serif-old', `"${t.fontSerif}", Georgia, serif`)

    const families = [t.fontPixel, t.fontTerm, t.fontSerif].filter(Boolean)
    let link = document.getElementById('theme-fonts') as HTMLLinkElement | null
    if (!link) { link = document.createElement('link'); link.id = 'theme-fonts'; link.rel = 'stylesheet'; document.head.appendChild(link) }
    link.href = `https://fonts.googleapis.com/css2?${families.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}`).join('&')}&display=swap`

    let style = document.getElementById('theme-custom-css') as HTMLStyleElement | null
    if (!style) { style = document.createElement('style'); style.id = 'theme-custom-css'; document.head.appendChild(style) }
    style.textContent = t.customCss
  }, [t])

  useEffect(() => { document.title = content.site.alias }, [content.site.alias])

  const value = useMemo<Ctx>(
    () => ({ content, posts, ready, setContent, setPosts, focusSlug, setFocusSlug }),
    [content, posts, ready, focusSlug],
  )
  return <ContentCtx.Provider value={value}>{children}</ContentCtx.Provider>
}

export function useContent(): Ctx {
  const c = useContext(ContentCtx)
  if (!c) throw new Error('useContent must be used inside <ContentProvider>')
  return c
}

export const useSetFocusSlug = () => {
  const { setFocusSlug } = useContent()
  return useCallback((s: string | null) => setFocusSlug(s), [setFocusSlug])
}
