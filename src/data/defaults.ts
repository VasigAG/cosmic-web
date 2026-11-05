import {
  about, apps, badges, diary, explorerSites, films, musicNotes, notes, projects,
  quotes, recycleBin, researchNotes, site, tracks, webring,
} from './content'
import type { Post } from '../types'

/** Everything editable from the Hood. The database stores a patch over this object. */
export const defaultContent = {
  site,
  theme: {
    space: '#080808',
    charcoal: '#1a1a1f',
    pink: '#ffb7d5',
    lavender: '#cdb4ff',
    baby: '#a8d8ff',
    butter: '#fff5b0',
    silver: '#c0c0c8',
    tb1: '#b48cf0',
    tb2: '#ff9ccb',
    tb3: '#a8d8ff',
    matrix: '#7dff9b',
    fontPixel: 'Press Start 2P',
    fontTerm: 'VT323',
    fontSerif: 'IM Fell English',
    crt: true,
    stars: 90,
    ufo: true,
    matrixRain: true,
    decor: ['🪐', '🦋', '☄️'],
    wallpaper: '',
    customCss: '/* your own CSS goes here, e.g.\n.bevel-out { border-radius: 6px; } */',
  },
  apps,
  quotes,
  about,
  projects,
  researchNotes,
  notes,
  diary,
  tracks,
  musicNotes,
  films,
  explorerSites,
  webring,
  recycleBin,
  badges,
}

export type Content = typeof defaultContent

export const samplePosts: Post[] = [
  {
    id: 'sample-1',
    slug: 'hello-world',
    title: 'Hello, world (again)',
    body: '# Hello!\n\nThis is the **first transmission** from my corner of the internet.\n\n- Write posts in *markdown*\n- Add [links](https://neocities.org) and images\n- Press **Cmd/Ctrl + K** to open the Hood and publish your own\n\n> This website is a work in progress. Reality is too.\n',
    tags: ['meta'],
    published: true,
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-01T00:00:00Z',
  },
]
