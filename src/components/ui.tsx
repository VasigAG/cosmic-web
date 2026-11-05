import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { sfx } from '../sfx'

export function Btn({ children, className = '', onClick, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      onClick={(e) => { sfx.click(); onClick?.(e) }}
      className={`bevel-out bg-silver px-3 py-0.5 font-term text-lg text-black active:bevel-in ${className}`}
    >
      {children}
    </button>
  )
}

export function H({ children, color = 'text-pink' }: { children: ReactNode; color?: string }) {
  return <h2 className={`mb-2 font-pixel text-[11px] leading-5 ${color}`}>{children}</h2>
}

export function Stars({ n, max = 5 }: { n: number; max?: number }) {
  return (
    <span aria-label={`${n} out of ${max} stars`} className="text-butter">
      {'★'.repeat(n)}<span className="text-white/20">{'★'.repeat(max - n)}</span>
    </span>
  )
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-[31px] w-[88px] items-center justify-center border border-white/60 bg-gradient-to-b from-lavender to-pink px-1 text-center font-pixel text-[6px] leading-[8px] text-black">
      {children}
    </span>
  )
}

export function Divider() {
  return <hr className="my-3 border-0 border-t border-dashed border-lavender/40" />
}
