import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { defaultContent } from '../data/defaults'
import type { Content } from '../data/defaults'
import { hasBackend, supabase } from '../lib/supabase'
import { deepMerge, useContent } from '../state/content'
import type { AppDef, Post } from '../types'
import DataEditor from './DataEditor'
import Markdown from '../lib/markdown'

type Flash = { kind: 'ok' | 'err'; text: string } | null
type PostDraft = Post & { _dirty?: boolean }

const GROUPS: { label: string; keys: (keyof Content)[] }[] = [
  { label: 'Site', keys: ['site', 'quotes', 'badges', 'recycleBin'] },
  { label: 'Theme', keys: ['theme'] },
  { label: 'Desktop', keys: ['apps'] },
  { label: 'About', keys: ['about'] },
  { label: 'Brain', keys: ['projects', 'researchNotes'] },
  { label: 'Math', keys: ['notes'] },
  { label: 'Diary', keys: ['diary'] },
  { label: 'Music', keys: ['tracks', 'musicNotes'] },
  { label: 'Cinema', keys: ['films'] },
  { label: 'Links', keys: ['explorerSites', 'webring'] },
]
const SPECIAL = ['Posts', 'Guestbook', 'Advanced'] as const

const btn = 'bevel-out bg-silver px-3 py-0.5 text-lg text-black active:bevel-in disabled:opacity-50'
const input = 'bevel-in w-full bg-white px-1 text-lg text-black'

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export default function Hood({ onClose }: { onClose: () => void }) {
  const { content, setContent, setPosts } = useContent()
  const originalContent = useRef<Content>(content)
  const originalJson = useRef(JSON.stringify(content))

  const [session, setSession] = useState<Session | null>(null)
  const [isOwner, setIsOwner] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(hasBackend)
  const [tab, setTab] = useState<string>('Site')
  const [flash, setFlash] = useState<Flash>(null)
  const [busy, setBusy] = useState(false)
  const [adminPosts, setAdminPosts] = useState<PostDraft[]>([])
  const [deletedIds, setDeletedIds] = useState<string[]>([])

  // ---- auth ----
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecking(false) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !session) { setIsOwner(null); return }
    supabase.rpc('is_owner').then(({ data, error }) => setIsOwner(error ? false : Boolean(data)))
  }, [session])

  // ---- load all posts (including drafts) once we know we're the owner ----
  useEffect(() => {
    if (!supabase || !isOwner) return
    supabase.from('posts').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setAdminPosts(data as Post[]) })
  }, [isOwner])

  const dirty = JSON.stringify(content) !== originalJson.current || adminPosts.some((p) => p._dirty) || deletedIds.length > 0

  const close = useCallback(() => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return
    setContent(originalContent.current)
    onClose()
  }, [dirty, onClose, setContent])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  // ---- save everything ----
  const save = async () => {
    if (!supabase || !isOwner) return
    setBusy(true)
    setFlash(null)
    try {
      const cfg = await supabase.from('site_config').upsert({ id: 1, data: content, updated_at: new Date().toISOString() })
      if (cfg.error) throw new Error(`Settings: ${cfg.error.message}`)

      const changed = adminPosts.filter((p) => p._dirty).map(({ _dirty, ...row }) => {
        void _dirty
        return { ...row, slug: slugify(row.slug || row.title) || `post-${row.id.slice(0, 8)}`, updated_at: new Date().toISOString() }
      })
      if (changed.length) {
        const r = await supabase.from('posts').upsert(changed)
        if (r.error) throw new Error(`Posts: ${r.error.message}${r.error.code === '23505' ? ' (two posts share a slug)' : ''}`)
      }
      if (deletedIds.length) {
        const r = await supabase.from('posts').delete().in('id', deletedIds)
        if (r.error) throw new Error(`Delete: ${r.error.message}`)
      }

      const next = adminPosts.map((p) => {
        const row = { ...p, slug: slugify(p.slug || p.title) || `post-${p.id.slice(0, 8)}` }
        delete row._dirty
        return row as Post
      })
      setAdminPosts(next)
      setDeletedIds([])
      setPosts(next.filter((p) => p.published))
      originalContent.current = content
      originalJson.current = JSON.stringify(content)
      setFlash({ kind: 'ok', text: 'Saved. Your site is updated for everyone. ✦' })
    } catch (e) {
      setFlash({ kind: 'err', text: e instanceof Error ? e.message : 'Save failed' })
    } finally {
      setBusy(false)
    }
  }

  const signedIn = hasBackend && session && isOwner

  return (
    <div className="fixed inset-0 z-[9500] flex items-center justify-center bg-black/70 p-0 sm:p-4" role="dialog" aria-modal aria-label="Hood admin panel">
      <div className="bevel-out flex h-full w-full max-w-5xl flex-col bg-silver text-black shadow-[8px_8px_0_rgba(0,0,0,.6)] sm:h-[92vh]">
        <div className="title-bar flex items-center gap-2 px-2 py-1 font-pixel text-[10px] text-white">
          <span className="flex-1 truncate">🔧 HOOD.EXE — sudo mode</span>
          {session && <button className="underline" onClick={() => supabase?.auth.signOut()}>sign out</button>}
          <button onClick={close} aria-label="Close" className="bevel-out h-5 w-5 bg-silver font-pixel text-[10px] text-black">×</button>
        </div>

        {/* body */}
        {checking ? (
          <p className="p-4 text-xl">checking session…</p>
        ) : hasBackend && !session ? (
          <Login onDone={() => setFlash(null)} />
        ) : hasBackend && isOwner === null ? (
          <p className="p-4 text-xl">verifying owner…</p>
        ) : hasBackend && isOwner === false ? (
          <NotOwner email={session?.user.email ?? ''} />
        ) : (
          <>
            {!hasBackend && (
              <p className="border-b border-[#808088] bg-[#fff5b0] p-2 text-base">
                No database connected yet, so edits are a live <b>preview only</b> and vanish on refresh. Follow SETUP.md to connect Supabase, or use Advanced → Download to keep a copy.
              </p>
            )}
            <div className="retro-scroll flex gap-1 overflow-x-auto border-b border-[#808088] p-1">
              {[...GROUPS.map((g) => g.label), ...SPECIAL].map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`${tab === t ? 'bevel-in bg-white' : 'bevel-out bg-silver'} shrink-0 px-3 text-lg`}>{t}</button>
              ))}
            </div>
            <div className="retro-scroll flex-1 overflow-auto p-3">
              {GROUPS.filter((g) => g.label === tab).map((g) => (
                <div key={g.label}>
                  {g.keys.map((k) => (
                    <DataEditor key={k} label={k} path={[k]} value={content[k]} onChange={(v) => setContent({ ...content, [k]: v } as Content)} />
                  ))}
                  {g.label === 'Desktop' && (
                    <button className={`${btn} mt-2`} onClick={() => {
                      const id = `page-${Date.now().toString(36)}`
                      const page: AppDef = { id, title: 'NEW.TXT', icon: '📄', label: 'New Page', w: 480, h: 400, page: '# Hello\n\nWrite **markdown** here.' }
                      setContent({ ...content, apps: [...content.apps, page] })
                    }}>+ add custom page</button>
                  )}
                </div>
              ))}
              {tab === 'Posts' && <PostsTab posts={adminPosts} setPosts={setAdminPosts} onDelete={(id) => setDeletedIds((d) => [...d, id])} enabled={Boolean(signedIn)} />}
              {tab === 'Guestbook' && <GuestbookTab enabled={Boolean(signedIn)} />}
              {tab === 'Advanced' && <Advanced content={content} setContent={setContent} />}
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-[#808088] p-2">
              <button className={btn} disabled={!signedIn || busy || !dirty} onClick={save}>{busy ? 'Saving…' : 'Update'}</button>
              <button className={btn} onClick={close}>{dirty ? 'Cancel' : 'Close'}</button>
              {dirty && <span className="text-base text-[#a02a5a]">● unsaved changes</span>}
              {flash && <span className={`text-base ${flash.kind === 'ok' ? 'text-[#1a7a3a]' : 'text-[#b02020]'}`} role="status">{flash.text}</span>}
              <span className="ml-auto hidden text-sm text-[#4a4a58] sm:block">changes preview live as you type · Esc to close</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ---------------- login ---------------- */
function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setErr(error.message)
    else onDone()
  }
  return (
    <form onSubmit={submit} className="mx-auto mt-10 w-full max-w-sm space-y-2 p-4">
      <h2 className="font-pixel text-[11px] text-[#6a2a8a]">ENTER THE HOOD</h2>
      <p className="text-base text-[#4a4a58]">Owner login. Visitors can never write anything to your site.</p>
      <label className="block text-base">Email<input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={input} required /></label>
      <label className="block text-base">Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} required /></label>
      {err && <p className="text-base text-[#b02020]" role="alert">{err}</p>}
      <button className={btn} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  )
}

function NotOwner({ email }: { email: string }) {
  return (
    <div className="p-4 text-lg">
      <p>Signed in as <b>{email}</b>, but this account is not an owner yet.</p>
      <p className="mt-2 text-base">Run the last block of <code>supabase/schema.sql</code> in the Supabase SQL editor (the <code>insert into public.admins</code> statement with your email), then sign in again.</p>
      <button className={`${btn} mt-3`} onClick={() => supabase?.auth.signOut()}>Sign out</button>
    </div>
  )
}

/* ---------------- posts ---------------- */
function PostsTab({ posts, setPosts, onDelete, enabled }: { posts: PostDraft[]; setPosts: (p: PostDraft[]) => void; onDelete: (id: string) => void; enabled: boolean }) {
  const [sel, setSel] = useState<string | null>(null)
  const ta = useRef<HTMLTextAreaElement>(null)
  const cur = posts.find((p) => p.id === sel) ?? null

  if (!enabled) return <p className="text-lg">Posts need the database. Connect Supabase (see SETUP.md), then sign in.</p>

  const patch = (changes: Partial<Post>) => setPosts(posts.map((p) => (p.id === sel ? { ...p, ...changes, _dirty: true } : p)))
  const create = () => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    setPosts([{ id, slug: `untitled-${id.slice(0, 4)}`, title: 'Untitled transmission', body: '', tags: [], published: false, created_at: now, updated_at: now, _dirty: true }, ...posts])
    setSel(id)
  }
  const insert = (before: string, after = '', placeholder = '') => {
    const el = ta.current
    if (!el || !cur) return
    const s = el.selectionStart
    const e = el.selectionEnd
    const mid = cur.body.slice(s, e) || placeholder
    patch({ body: cur.body.slice(0, s) + before + mid + after + cur.body.slice(e) })
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, s + before.length + mid.length) })
  }

  return (
    <div className="grid gap-3 md:grid-cols-[220px_1fr]">
      <div>
        <button className={`${btn} mb-2 w-full`} onClick={create}>+ new post</button>
        <ul className="space-y-1">
          {posts.map((p) => (
            <li key={p.id}>
              <button onClick={() => setSel(p.id)} className={`${p.id === sel ? 'bevel-in bg-white' : 'bevel-out bg-silver'} block w-full px-2 py-1 text-left`}>
                <div className="truncate text-lg">{p._dirty ? '● ' : ''}{p.title || '(no title)'}</div>
                <div className="text-sm text-[#4a4a58]">{p.published ? 'published' : 'draft'} · {p.created_at.slice(0, 10)}</div>
              </button>
            </li>
          ))}
          {posts.length === 0 && <li className="text-base text-[#4a4a58]">No posts yet.</li>}
        </ul>
      </div>
      {cur ? (
        <div className="space-y-2">
          <label className="block text-base">Title<input className={input} value={cur.title} onChange={(e) => patch({ title: e.target.value })} /></label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-base">Slug (URL part)<input className={input} value={cur.slug} onChange={(e) => patch({ slug: slugify(e.target.value) })} /></label>
            <label className="block text-base">Tags (comma separated)<input className={input} value={cur.tags.join(', ')} onChange={(e) => patch({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} /></label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1 text-lg"><input type="checkbox" checked={cur.published} onChange={(e) => patch({ published: e.target.checked })} /> published</label>
            <label className="flex items-center gap-1 text-base">date
              <input type="date" className={input} value={cur.created_at.slice(0, 10)} onChange={(e) => e.target.value && patch({ created_at: new Date(`${e.target.value}T12:00:00Z`).toISOString() })} />
            </label>
            <button className={`${btn} ml-auto`} onClick={() => { if (window.confirm('Delete this post?')) { onDelete(cur.id); setPosts(posts.filter((p) => p.id !== cur.id)); setSel(null) } }}>delete</button>
          </div>
          <div className="flex flex-wrap gap-1" role="toolbar" aria-label="Formatting">
            {([['B', '**', '**', 'bold'], ['I', '*', '*', 'italic'], ['H2', '\n## ', '', 'Heading'], ['❝', '\n> ', '', 'quote'], ['•', '\n- ', '', 'item'], ['</>', '`', '`', 'code'], ['🔗', '[', '](https://)', 'link text'], ['🖼', '![', '](https://)', 'alt text']] as [string, string, string, string][]).map(([l, b, a, ph]) => (
              <button key={l} type="button" className={btn} onClick={() => insert(b, a, ph)}>{l}</button>
            ))}
          </div>
          <div className="grid gap-2 lg:grid-cols-2">
            <textarea ref={ta} value={cur.body} onChange={(e) => patch({ body: e.target.value })} rows={16} className={`${input} font-mono text-sm`} aria-label="Post body (markdown)" placeholder="Write in markdown…" />
            <div className="retro-scroll bevel-in max-h-[380px] overflow-auto bg-[#0e0e14] p-2 text-white" aria-label="Preview"><Markdown source={cur.body || '*preview appears here*'} /></div>
          </div>
          <p className="text-sm text-[#4a4a58]">Remember to press <b>Update</b> to publish. Drafts are visible only to you.</p>
        </div>
      ) : <p className="text-lg text-[#4a4a58]">Pick a post, or start a new one.</p>}
    </div>
  )
}

/* ---------------- guestbook moderation ---------------- */
interface GRow { id: string; name: string; message: string; approved: boolean; created_at: string }

function GuestbookTab({ enabled }: { enabled: boolean }) {
  const [rows, setRows] = useState<GRow[]>([])
  const load = useCallback(() => {
    if (!supabase) return
    supabase.from('guestbook').select('*').order('created_at', { ascending: false }).limit(200).then(({ data }) => setRows((data ?? []) as GRow[]))
  }, [])
  useEffect(() => { if (enabled) load() }, [enabled, load])
  if (!enabled) return <p className="text-lg">Guestbook moderation needs the database. Connect Supabase (see SETUP.md), then sign in.</p>

  const approve = async (r: GRow, v: boolean) => { await supabase?.from('guestbook').update({ approved: v }).eq('id', r.id); load() }
  const del = async (r: GRow) => { await supabase?.from('guestbook').delete().eq('id', r.id); load() }

  return (
    <div>
      <p className="mb-2 text-base text-[#4a4a58]">New messages stay hidden until you approve them. These actions apply immediately.</p>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={r.id} className="bevel-out flex items-start gap-2 bg-[#e0e0ea] p-2">
            <div className="min-w-0 flex-1">
              <div className="text-lg"><b>{r.name}</b> <span className="text-sm text-[#4a4a58]">{r.created_at.slice(0, 10)} · {r.approved ? 'visible' : 'pending'}</span></div>
              <div className="break-words text-base">{r.message}</div>
            </div>
            <button className={btn} onClick={() => approve(r, !r.approved)}>{r.approved ? 'hide' : 'approve'}</button>
            <button className={btn} onClick={() => del(r)}>delete</button>
          </li>
        ))}
        {rows.length === 0 && <li className="text-lg text-[#4a4a58]">No messages yet.</li>}
      </ul>
    </div>
  )
}

/* ---------------- advanced ---------------- */
function Advanced({ content, setContent }: { content: Content; setContent: (c: Content) => void }) {
  const [text, setText] = useState(() => JSON.stringify(content, null, 2))
  const [err, setErr] = useState('')
  const apply = () => {
    try { setContent(deepMerge(defaultContent, JSON.parse(text))); setErr('') } catch { setErr('That is not valid JSON.') }
  }
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'cosmic-site-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="space-y-2">
      <p className="text-base text-[#4a4a58]">Raw JSON of everything above. Paste a backup and Apply, then press Update to save it.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={18} className={`${input} font-mono text-sm`} aria-label="Raw site JSON" spellCheck={false} />
      {err && <p className="text-base text-[#b02020]" role="alert">{err}</p>}
      <div className="flex flex-wrap gap-2">
        <button className={btn} onClick={apply}>Apply JSON</button>
        <button className={btn} onClick={() => setText(JSON.stringify(content, null, 2))}>Refresh from editor</button>
        <button className={btn} onClick={download}>Download backup</button>
        <button className={btn} onClick={() => { if (window.confirm('Reset every section and the theme to factory defaults? (Press Cancel afterwards to undo before saving.)')) { setContent(defaultContent); setText(JSON.stringify(defaultContent, null, 2)) } }}>Reset to defaults</button>
      </div>
    </div>
  )
}
