# COSMIC PERSONAL WEB

Windows 98 / Webcore / Spacecore personal site. React + TypeScript + Tailwind v4 (Vite) with a Supabase backend.

**Edit everything without touching code:** open the site and press **Cmd/Ctrl + K** (on a phone: tap the site name 5 times) to open the Hood, change anything, write blog posts, press **Update**.

**One-time setup (database + hosting): see [SETUP.md](./SETUP.md).**

## Run locally

```
cp .env.example .env.local   # Supabase URL + anon key (optional; site runs on defaults without them)
npm install
npm run dev
npm run build
```

## Where things live

- `src/data/content.ts`: factory-default content (the database stores your edits on top of this)
- `src/data/defaults.ts`: assembles defaults + theme
- `src/state/content.tsx`: loads saved content, applies theme
- `src/components/Hood.tsx` + `DataEditor.tsx`: the admin panel
- `src/components/apps/`: each window (About, Blog, Brain Lab, Math Dungeon, …)
- `supabase/schema.sql`: tables and security rules

## Secrets

Type the word in `site.secretCode` (default `saturn`) on the desktop, or tap the visitor counter 5 times.
