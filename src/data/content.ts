import type { AppDef, DiaryEntry, Film, GuestMsg, Note, Project, SiteLink, Track } from '../types'

/* ============================================================
   EDIT ME. Everything personal lives in this file.
   ============================================================ */

export const site = {
  alias: 'stardust.exe',
  tagline: 'Currently: contemplating the universe.exe',
  footer: 'This website is a work in progress. Reality is too.',
  baseVisitors: 31337,
  secretCode: 'saturn', // type this anywhere on the desktop to unlock SECRET.EXE
}

export const quotes: string[] = [
  'The brain is the only organ that named itself.',
  'Every theorem was a guess wearing a disguise.',
  'Somewhere a qubit is both and neither, and it is fine.',
  'You are the universe, politely examining itself.',
  'Noise is just signal you have not met yet.',
  'Build the thing. Then understand the thing.',
  'It is 2003 somewhere in here.',
]

export const apps: AppDef[] = [
  { id: 'about', title: 'ABOUT.EXE', icon: '💾', label: 'My Computer', w: 560, h: 460 },
  { id: 'brain', title: 'BRAIN LAB', icon: '🧠', label: 'Brain.exe', w: 620, h: 480 },
  { id: 'math', title: 'MATH DUNGEON — star map', icon: '🔮', label: 'Math Dungeon', w: 640, h: 500 },
  { id: 'diary', title: 'diary.txt - Notepad', icon: '📓', label: 'Stardust', w: 480, h: 480 },
  { id: 'music', title: 'MY FREQUENCIES', icon: '🎧', label: 'Winamp', w: 400, h: 470 },
  { id: 'cinema', title: 'CINEMA ARCHIVE', icon: '🎞️', label: 'Movie Archive', w: 560, h: 470 },
  { id: 'blog', title: 'BLOG.EXE — transmissions', icon: '📡', label: 'Blog.exe', w: 640, h: 500 },
  { id: 'explorer', title: 'INTERNET EXPLORER', icon: '🌐', label: 'Internet Explorer', w: 620, h: 480 },
  { id: 'guestbook', title: 'GUESTBOOK', icon: '✍️', label: 'Guestbook', w: 480, h: 500 },
  { id: 'links', title: 'LINKS.EXE — webring', icon: '🔗', label: 'Links.exe', w: 460, h: 440 },
  { id: 'bin', title: 'Recycle Bin', icon: '🗑️', label: 'Recycle Bin', w: 420, h: 360 },
  { id: 'sitemap', title: 'SITEMAP.EXE', icon: '🗺️', label: 'Site Map', w: 460, h: 420 },
  { id: 'secret', title: 'SECRET.EXE', icon: '👽', label: 'Secret.exe', w: 520, h: 420, hidden: true },
]

export const about = {
  name: 'Your Name Here',
  pronouns: 'she/he/they',
  location: 'Earth (for now)',
  bio: 'Hello, traveler! I study how matter becomes mind and how math describes both. I build things at the edge of neuroscience, quantum computing, and engineering, and I play guitar and piano badly but with enthusiasm.',
  beliefs: [
    'Consciousness is the most interesting unsolved problem there is.',
    'Curiosity beats credentials.',
    'Make weird things on purpose.',
  ],
  ambitions: [
    'Build a brain-computer interface that actually helps someone',
    'Understand quantum computation well enough to explain it to a cat',
    'Finish one album. Just one.',
  ],
  interests: ['neuroscience', 'neuroengineering', 'mathematics', 'quantum computing', 'physics', 'music', 'cinema', 'philosophy'],
  timeline: [
    { year: '2003', text: 'Discovered the internet. It discovered me back.' },
    { year: '2012', text: 'First line of code. First infinite loop.' },
    { year: '2018', text: 'Fell down the neuroscience rabbit hole.' },
    { year: '2022', text: 'Started building research prototypes.' },
    { year: '2026', text: 'Built this corner of the web.' },
  ],
}

export const projects: Project[] = [
  { name: 'neural-decoder-v0.3', status: 'running', blurb: 'Decoding simple motor intent from noisy EEG using small, interpretable models.', tags: ['EEG', 'ML', 'BCI'] },
  { name: 'consciousness-reading-list', status: 'running', blurb: 'Annotated tour through integrated information, global workspace, and predictive processing.', tags: ['theory', 'notes'] },
  { name: 'spike-sandbox', status: 'paused', blurb: 'A tiny spiking neural network simulator in the browser.', tags: ['simulation', 'TS'] },
  { name: 'dream-journal-analyzer', status: 'idea', blurb: 'Do dreams cluster? Probably. Let us find out.', tags: ['NLP', 'sleep'] },
  { name: 'bloch-sphere-toy', status: 'done', blurb: 'Interactive qubit playground. Drag the state vector, watch the gates.', tags: ['quantum', 'viz'] },
]

export const researchNotes: { date: string; text: string }[] = [
  { date: '2026-10-28', text: 'Re-read the global workspace papers. Still not convinced broadcast is sufficient.' },
  { date: '2026-10-14', text: 'Signal cleaning pipeline cut artifact rate by a third. Coffee helped too.' },
  { date: '2026-09-30', text: 'Idea: treat attention as a learned compression budget.' },
]

export const notes: Note[] = [
  { id: 'qubit', title: 'Qubit', body: 'A two-level quantum system. State lives on the Bloch sphere: α|0⟩ + β|1⟩ with |α|²+|β|²=1.', links: ['pauli', 'bloch', 'superposition'], x: 50, y: 45 },
  { id: 'pauli', title: 'Pauli matrices', body: 'σx, σy, σz. Hermitian, unitary, anticommuting. The generators of single-qubit rotations.', links: ['qubit', 'bloch', 'groups'], x: 18, y: 22 },
  { id: 'bloch', title: 'Bloch sphere', body: 'Geometric picture of a pure qubit state as a point on a unit sphere.', links: ['qubit', 'pauli'], x: 80, y: 22 },
  { id: 'superposition', title: 'Superposition', body: 'Linear combinations of basis states. Measurement collapses to one outcome with Born-rule probability.', links: ['qubit', 'entangle'], x: 78, y: 72 },
  { id: 'entangle', title: 'Entanglement', body: 'Correlations no product state can explain. The resource behind teleportation and speedups.', links: ['superposition', 'info'], x: 48, y: 88 },
  { id: 'groups', title: 'Lie groups', body: 'SU(2) double-covers SO(3). That is why spin-½ needs a 720° rotation to come back.', links: ['pauli'], x: 16, y: 62 },
  { id: 'info', title: 'Information', body: 'Entropy, mutual information, and the strange idea that bits might be physical.', links: ['entangle', 'phi'], x: 24, y: 86 },
  { id: 'phi', title: 'Integrated information', body: 'A theory that tries to measure consciousness with a number, Φ. Controversial, fascinating.', links: ['info', 'neural'], x: 12, y: 40 },
  { id: 'neural', title: 'Neural dynamics', body: 'Attractors, oscillations, and criticality. The brain as a dynamical system riding the edge of chaos.', links: ['phi'], x: 62, y: 12 },
]

export const diary: DiaryEntry[] = [
  { id: 'd3', date: '2026-11-03 02:14', mood: 'oddly awake', title: 'night thoughts', body: 'Is it strange that a neuron knows nothing\nand yet a hundred billion of them know me?\n\nI keep circling this. Going to sleep anyway.' },
  { id: 'd2', date: '2026-10-21 17:40', mood: 'caffeinated', title: 'fragment', body: 'A list of things that are bigger than they look:\n- the shower thought\n- the small decision\n- Tuesday' },
  { id: 'd1', date: '2026-10-02 23:05', mood: 'nostalgic', title: 'first entry', body: 'Hello, diary.\nThis site now exists, which means I have to keep writing in it.\nThat is how websites trap you.' },
]

export const tracks: Track[] = [
  { title: 'Neon Dendrites', artist: 'placeholder artist', length: 214 },
  { title: 'Spacebar Lullaby', artist: 'placeholder artist', length: 187 },
  { title: 'Bloch Sphere Blues', artist: 'placeholder artist', length: 242 },
  { title: 'Dial-up Dreams', artist: 'placeholder artist', length: 196 },
  { title: 'Saturn Ring Road', artist: 'placeholder artist', length: 261 },
]

export const musicNotes = {
  currently: 'Learning: Clair de Lune (slowly), pentatonic scales on guitar',
  albums: ['Replace with your favourite albums', 'Keep a few weird ones in here', 'Liner notes optional'],
}

export const films: Film[] = [
  { title: 'Solaris', director: 'Andrei Tarkovsky', year: 1972, rating: 5, note: 'Memory, grief, and an ocean that thinks.' },
  { title: 'Primer', director: 'Shane Carruth', year: 2004, rating: 5, note: 'Time travel as engineering. Requires a flowchart.' },
  { title: 'Eternal Sunshine of the Spotless Mind', director: 'Michel Gondry', year: 2004, rating: 5, note: 'Neuroscience, but make it heartbreak.' },
  { title: 'Stalker', director: 'Andrei Tarkovsky', year: 1979, rating: 4, note: 'Slow. Worth every second.' },
  { title: 'Her', director: 'Spike Jonze', year: 2013, rating: 4, note: 'Falling for a voice. Aging better each year.' },
]

export const explorerSites: SiteLink[] = [
  { name: 'Neocities', url: 'https://neocities.org', blurb: 'Make your own free website, the old way.' },
  { name: 'Wiby', url: 'https://wiby.me', blurb: 'A search engine for the surprising old web.' },
  { name: 'The Internet Archive', url: 'https://archive.org', blurb: 'Everything, forever, hopefully.' },
  { name: 'Marginalia Search', url: 'https://search.marginalia.nu', blurb: 'Search for small, text-heavy websites.' },
  { name: 'Hypnospace Outlaw', url: 'https://www.hypnospace.net', blurb: 'A game about the 1999 internet that never was.' },
]

export const webring: SiteLink[] = [
  { name: 'Neocities Browse', url: 'https://neocities.org/browse', blurb: 'Wander other people’s little universes.' },
  { name: 'Nekoweb', url: 'https://nekoweb.org', blurb: 'Another cozy corner for handmade sites.' },
  { name: 'Wiby Surprise Me', url: 'https://wiby.me/surprise', blurb: 'A random page from the old web.' },
  { name: 'Add your friends here', url: '#', blurb: 'Replace these with real people.' },
]

export const guestSeed: GuestMsg[] = [
  { name: 'cosmic_cat', msg: 'cool site!! love the stars ★', date: '2026-10-30' },
  { name: 'anon', msg: 'the UFO scared me, 10/10', date: '2026-10-31' },
]

export const recycleBin: string[] = [
  'thought_#4821 (unfinished).txt',
  'embarrassing_poem_2019.doc',
  'plan_to_learn_everything.xls',
  'sleep_schedule.bak',
]

export const badges = ['made with ♥', 'best viewed in Netscape', 'valid HTML 4.01*', 'no AI hype', 'webring member', 'Y2K compliant']
