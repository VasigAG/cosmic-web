import { useCallback, useReducer, useRef } from 'react'
import type { AppDef, AppId, WinState } from '../types'

interface State { wins: WinState[]; zTop: number; counter: number }

type Action =
  | { type: 'open'; def: AppDef; vw: number; vh: number }
  | { type: 'close'; key: string }
  | { type: 'focus'; key: string }
  | { type: 'minimize'; key: string }
  | { type: 'toggleMax'; key: string }
  | { type: 'move'; key: string; x: number; y: number }
  | { type: 'resize'; key: string; w: number; h: number }

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'open': {
      const existing = s.wins.find((w) => w.appId === a.def.id)
      const z = s.zTop + 1
      if (existing) {
        return { ...s, zTop: z, wins: s.wins.map((w) => (w.key === existing.key ? { ...w, minimized: false, z } : w)) }
      }
      const mobile = a.vw < 700
      const w = mobile ? a.vw - 8 : Math.min(a.def.w, a.vw - 40)
      const h = mobile ? a.vh - 90 : Math.min(a.def.h, a.vh - 90)
      const off = (s.counter % 8) * 28
      const win: WinState = {
        key: `${a.def.id}-${s.counter}`,
        appId: a.def.id,
        x: mobile ? 4 : Math.max(10, Math.min(110 + off, a.vw - w - 10)),
        y: mobile ? 36 : Math.max(40, Math.min(60 + off, a.vh - h - 50)),
        w, h, z, minimized: false, maximized: mobile,
      }
      return { ...s, zTop: z, counter: s.counter + 1, wins: [...s.wins, win] }
    }
    case 'close':
      return { ...s, wins: s.wins.filter((w) => w.key !== a.key) }
    case 'focus': {
      const z = s.zTop + 1
      return { ...s, zTop: z, wins: s.wins.map((w) => (w.key === a.key ? { ...w, z, minimized: false } : w)) }
    }
    case 'minimize':
      return { ...s, wins: s.wins.map((w) => (w.key === a.key ? { ...w, minimized: true } : w)) }
    case 'toggleMax':
      return { ...s, wins: s.wins.map((w) => (w.key === a.key ? { ...w, maximized: !w.maximized } : w)) }
    case 'move':
      return { ...s, wins: s.wins.map((w) => (w.key === a.key ? { ...w, x: a.x, y: a.y } : w)) }
    case 'resize':
      return { ...s, wins: s.wins.map((w) => (w.key === a.key ? { ...w, w: a.w, h: a.h } : w)) }
  }
}

/** `apps` comes from live content, so renamed or removed apps stay consistent. */
export function useWindows(apps: AppDef[]) {
  const [state, dispatch] = useReducer(reducer, { wins: [], zTop: 10, counter: 0 })
  const appsRef = useRef(apps)
  appsRef.current = apps

  const open = useCallback((appId: AppId) => {
    const def = appsRef.current.find((a) => a.id === appId)
    if (def) dispatch({ type: 'open', def, vw: window.innerWidth, vh: window.innerHeight })
  }, [])

  // windows whose app was deleted in the Hood simply disappear
  const wins = state.wins.filter((w) => apps.some((a) => a.id === w.appId))
  return {
    wins,
    topKey: wins.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0]?.key,
    open,
    close: (key: string) => dispatch({ type: 'close', key }),
    focus: (key: string) => dispatch({ type: 'focus', key }),
    minimize: (key: string) => dispatch({ type: 'minimize', key }),
    toggleMax: (key: string) => dispatch({ type: 'toggleMax', key }),
    move: (key: string, x: number, y: number) => dispatch({ type: 'move', key, x, y }),
    resize: (key: string, w: number, h: number) => dispatch({ type: 'resize', key, w, h }),
  }
}
