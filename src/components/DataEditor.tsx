import { defaultContent } from '../data/defaults'

/* A generic editor for any JSON-like value. Because every section of the site is plain data,
   this one component edits all of it: strings, numbers, toggles, colors, lists and nested objects. */

type Path = (string | number)[]
type Rec = Record<string, unknown>

const TEXTAREA_KEYS = new Set(['body', 'bio', 'blurb', 'note', 'text', 'page', 'customCss', 'msg', 'currently'])
const ENUMS: Record<string, string[]> = { status: ['running', 'paused', 'idea', 'done'] }
const TITLE_KEYS = ['name', 'title', 'label', 'text', 'id', 'year', 'date']
const HEX = /^#[0-9a-f]{6}$/i

function templateAt(path: Path): unknown {
  let cur: unknown = defaultContent
  for (const seg of path) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Rec)[typeof seg === 'number' ? 0 : seg]
  }
  return cur
}

function blank(v: unknown): unknown {
  if (typeof v === 'string') return ''
  if (typeof v === 'number') return 0
  if (typeof v === 'boolean') return false
  if (Array.isArray(v)) return []
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v as Rec).map(([k, x]) => [k, blank(x)]))
  return ''
}

function itemTitle(v: unknown, i: number): string {
  if (v && typeof v === 'object') {
    for (const k of TITLE_KEYS) {
      const x = (v as Rec)[k]
      if (typeof x === 'string' && x.trim()) return x.length > 40 ? `${x.slice(0, 40)}…` : x
    }
  }
  if (typeof v === 'string' && v.trim()) return v.length > 40 ? `${v.slice(0, 40)}…` : v
  return `item ${i + 1}`
}

const inputCls = 'bevel-in w-full bg-white px-1 text-lg text-black'
const smallBtn = 'bevel-out bg-silver px-2 text-base leading-5 text-black active:bevel-in'

interface Props {
  value: unknown
  onChange: (v: unknown) => void
  path: Path
  label: string
}

export default function DataEditor({ value, onChange, path, label }: Props) {
  const key = String(path[path.length - 1] ?? label)

  if (typeof value === 'boolean') {
    return (
      <label className="flex items-center gap-2 py-0.5 text-lg">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
        {label}
      </label>
    )
  }

  if (typeof value === 'number') {
    return (
      <label className="block py-0.5 text-base">
        <span className="text-[#4a4a58]">{label}</span>
        <input type="number" value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(Number(e.target.value))} className={inputCls} />
      </label>
    )
  }

  if (typeof value === 'string') {
    if (HEX.test(value)) {
      return (
        <label className="block py-0.5 text-base">
          <span className="text-[#4a4a58]">{label}</span>
          <span className="flex gap-1">
            <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-10 shrink-0 cursor-pointer" aria-label={`${label} color`} />
            <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
          </span>
        </label>
      )
    }
    if (ENUMS[key]) {
      return (
        <label className="block py-0.5 text-base">
          <span className="text-[#4a4a58]">{label}</span>
          <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
            {ENUMS[key].map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
      )
    }
    const multi = TEXTAREA_KEYS.has(key) || value.includes('\n') || value.length > 80
    return (
      <label className="block py-0.5 text-base">
        <span className="text-[#4a4a58]">{label}</span>
        {multi
          ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={Math.min(14, Math.max(3, value.split('\n').length + 1))} className={`${inputCls} font-mono text-sm`} spellCheck={key !== 'customCss' && key !== 'page'} />
          : <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />}
      </label>
    )
  }

  if (Array.isArray(value)) {
    const tpl = templateAt([...path, 0])
    const add = () => onChange([...value, blank(tpl)])
    const move = (i: number, d: number) => {
      const j = i + d
      if (j < 0 || j >= value.length) return
      const next = [...value]
      ;[next[i], next[j]] = [next[j], next[i]]
      onChange(next)
    }
    return (
      <fieldset className="my-2 border border-dashed border-[#808088] p-2">
        <legend className="px-1 font-pixel text-[9px] text-[#6a2a8a]">{label} ({value.length})</legend>
        {value.map((item, i) => {
          const primitive = item === null || typeof item !== 'object'
          const controls = (
            <span className="flex shrink-0 gap-1">
              <button type="button" className={smallBtn} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
              <button type="button" className={smallBtn} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
              <button type="button" className={smallBtn} onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Delete item">✕</button>
            </span>
          )
          const setItem = (v: unknown) => onChange(value.map((x, j) => (j === i ? v : x)))
          if (primitive) {
            return (
              <div key={i} className="flex items-end gap-1">
                <div className="flex-1"><DataEditor value={item} onChange={setItem} path={[...path, i]} label={`#${i + 1}`} /></div>
                {controls}
              </div>
            )
          }
          return (
            <details key={i} className="bevel-out my-1 bg-[#e0e0ea]">
              <summary className="flex cursor-pointer items-center justify-between gap-2 px-2 py-1 text-lg">
                <span className="truncate">{itemTitle(item, i)}</span>
                {controls}
              </summary>
              <div className="border-t border-[#808088] p-2">
                <DataEditor value={item} onChange={setItem} path={[...path, i]} label={`${label} #${i + 1}`} />
              </div>
            </details>
          )
        })}
        <button type="button" className={`${smallBtn} mt-1`} onClick={add}>+ add</button>
      </fieldset>
    )
  }

  if (value && typeof value === 'object') {
    const obj = value as Rec
    const top = path.length <= 1
    return (
      <div className={top ? '' : 'space-y-0.5'}>
        {top && <h3 className="mb-1 font-pixel text-[10px] text-[#6a2a8a]">{label}</h3>}
        {Object.keys(obj).map((k) => (
          <DataEditor key={k} value={obj[k]} onChange={(v) => onChange({ ...obj, [k]: v })} path={[...path, k]} label={k} />
        ))}
      </div>
    )
  }

  return null
}
