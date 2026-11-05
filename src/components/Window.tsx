import { useRef } from 'react'
import type { ReactNode, PointerEvent as RPE } from 'react'
import type { WinState } from '../types'

interface Props {
  win: WinState
  title: string
  active: boolean
  onFocus: () => void
  onClose: () => void
  onMinimize: () => void
  onToggleMax: () => void
  onMove: (x: number, y: number) => void
  onResize: (w: number, h: number) => void
  children: ReactNode
}

export default function Window({ win, title, active, onFocus, onClose, onMinimize, onToggleMax, onMove, onResize, children }: Props) {
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const size = useRef<{ sx: number; sy: number; w: number; h: number } | null>(null)

  const startDrag = (e: RPE<HTMLDivElement>) => {
    if (win.maximized || (e.target as HTMLElement).closest('button')) return
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const moveDrag = (e: RPE<HTMLDivElement>) => {
    if (!drag.current) return
    const x = Math.max(-win.w + 80, Math.min(window.innerWidth - 80, e.clientX - drag.current.dx))
    const y = Math.max(28, Math.min(window.innerHeight - 70, e.clientY - drag.current.dy))
    onMove(x, y)
  }
  const endDrag = () => { drag.current = null }

  const startSize = (e: RPE<HTMLDivElement>) => {
    if (win.maximized) return
    e.stopPropagation()
    size.current = { sx: e.clientX, sy: e.clientY, w: win.w, h: win.h }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const moveSize = (e: RPE<HTMLDivElement>) => {
    if (!size.current) return
    onResize(Math.max(260, size.current.w + e.clientX - size.current.sx), Math.max(160, size.current.h + e.clientY - size.current.sy))
  }
  const endSize = () => { size.current = null }

  const style = win.maximized
    ? { left: 0, top: 28, width: '100vw', height: 'calc(100vh - 28px - 36px)', zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }

  return (
    <div
      role="dialog"
      aria-label={title}
      onPointerDown={onFocus}
      className="bevel-out absolute flex flex-col bg-silver text-black shadow-[6px_6px_0_rgba(0,0,0,.6)]"
      style={{ ...style, display: win.minimized ? 'none' : 'flex' }}
    >
      <div
        className={`${active ? 'title-bar' : 'title-bar-inactive'} flex touch-none select-none items-center gap-1 px-1 py-0.5 font-pixel text-[10px] text-white`}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onDoubleClick={onToggleMax}
      >
        <span className="flex-1 truncate drop-shadow-[1px_1px_0_rgba(0,0,0,.5)]">{title}</span>
        <TitleBtn label="Minimize" onClick={onMinimize}>_</TitleBtn>
        <TitleBtn label="Maximize" onClick={onToggleMax}>{win.maximized ? '❐' : '□'}</TitleBtn>
        <TitleBtn label="Close" onClick={onClose}>×</TitleBtn>
      </div>
      <div className="bevel-in retro-scroll m-1 flex-1 overflow-auto bg-[#0e0e14] text-[#e8e8f0]">{children}</div>
      {!win.maximized && (
        <div
          aria-hidden
          className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize touch-none"
          style={{ background: 'linear-gradient(135deg, transparent 50%, #808088 50%, #808088 60%, transparent 60%, transparent 70%, #808088 70%, #808088 80%, transparent 80%)' }}
          onPointerDown={startSize}
          onPointerMove={moveSize}
          onPointerUp={endSize}
        />
      )}
    </div>
  )
}

function TitleBtn({ children, label, onClick }: { children: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="bevel-out flex h-4 w-4 items-center justify-center bg-silver font-pixel text-[9px] leading-none text-black active:bevel-in"
    >
      {children}
    </button>
  )
}
