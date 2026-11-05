export type AppId = string

export interface AppDef {
  id: AppId
  title: string
  icon: string
  label: string
  w: number
  h: number
  /** hidden apps get no desktop icon or sitemap entry (SECRET.EXE is unlocked by code) */
  hidden?: boolean
  /** markdown body for custom pages (ignored by built-in apps) */
  page?: string
}

export interface WinState {
  key: string
  appId: AppId
  x: number
  y: number
  w: number
  h: number
  z: number
  minimized: boolean
  maximized: boolean
}

export type ProjectStatus = 'running' | 'paused' | 'idea' | 'done'

export interface Project { name: string; status: ProjectStatus; blurb: string; tags: string[] }
export interface Note { id: string; title: string; body: string; links: string[]; x: number; y: number }
export interface DiaryEntry { id: string; date: string; mood: string; title: string; body: string }
export interface Track { title: string; artist: string; length: number }
export interface Film { title: string; director: string; year: number; rating: number; note: string }
export interface SiteLink { name: string; url: string; blurb: string }
export interface GuestMsg { name: string; msg: string; date: string }

export interface Post {
  id: string
  slug: string
  title: string
  body: string
  tags: string[]
  published: boolean
  created_at: string
  updated_at: string
}
