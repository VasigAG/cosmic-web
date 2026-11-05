# Setup: database, hosting, and the Hood

You will end up with: the site live on the internet, and a **Hood** (press **Cmd+K** on Mac, **Ctrl+K** on Windows/Linux) where you log in, edit anything, write blog posts, and press **Update**. No code changes or redeploys after this one-time setup.

**Stack (all free tiers):** Supabase (database + login) + Cloudflare Pages (hosting). Vercel and Netlify work identically; see the note at the end.

---

## Step 1: Create the database (Supabase)

1. Go to https://supabase.com, sign up, and click **New project**. Pick any name and region, and save the database password somewhere.
2. When the project is ready, open **SQL Editor → New query**, paste the entire contents of `supabase/schema.sql`, and click **Run**. This creates the tables and the security rules (only the owner can write; visitors can only read, and submit guestbook messages that wait for your approval).
3. **Create your login:** **Authentication → Users → Add user → Create new user**. Enter your email and a strong password, and tick **Auto Confirm User**.
4. **Make that user the owner:** back in the SQL Editor, run this with your email:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com'
   on conflict do nothing;
   ```
5. **Lock out strangers:** **Authentication → Sign In / Providers → Email** (wording may differ slightly) and turn **off** "Allow new users to sign up". Even if this were left on, only users in the `admins` table can write, but there is no reason to leave it open.
6. Copy two values from **Project Settings → API** (called "API Keys" in newer dashboards): the **Project URL** and the **anon / publishable** key. These two are safe to put in a website because the security rules protect your data. **Never use the `service_role` / secret key in this project.**

## Step 2: Put the code on GitHub

```bash
cd cosmic-web
git init
git add .
git commit -m "first commit"
# create an empty repo on github.com, then:
git remote add origin https://github.com/YOU/cosmic-web.git
git push -u origin main
```
(`.env.local` is not committed, so your keys stay out of git. They go into the host in the next step.)

## Step 3: Host it (Cloudflare Pages)

1. Go to https://dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git**, and pick your repo.
2. Build settings: **Framework preset:** Vite · **Build command:** `npm run build` · **Build output directory:** `dist`
3. Under **Environment variables**, add:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon/publishable key
   - `NODE_VERSION` = `20`
4. **Save and Deploy.** You get a `*.pages.dev` address. Add your own domain under **Custom domains** whenever you like.

## Step 4: Use it

Open your live site and press **Cmd/Ctrl + K**. On a phone, tap the site name in the top-left bar **five times**. Sign in with the email and password from step 1.3.

- **Site / Theme / Desktop / About / Brain / …** edit all text, colors, fonts, effects, desktop icons, wallpaper, and your own custom CSS. Changes preview live as you type.
- **Desktop → + add custom page** creates a new desktop icon with a markdown page.
- **Posts** is your blog: title, slug, tags, publish date, a markdown editor with a live preview, and a draft/published switch. Readers see them in the **Blog.exe** window. A post is shareable at `https://yoursite/#/blog/your-slug`.
- **Guestbook** approves, hides, or deletes visitor messages (nothing shows until you approve it).
- **Advanced** is the raw JSON: download a backup, paste one back, or reset to defaults.
- Press **Update** and you are done. It saves to the database and the site is updated for every visitor on their next load.

## Local development

```bash
cp .env.example .env.local   # fill in the two values
npm install
npm run dev
```
Without the two env vars the site runs on the built-in defaults, and the Hood opens as a preview-only editor.

---

## Things worth knowing

- **Supabase free projects pause after about 7 days of low activity** (per Supabase's docs, a few requests a day is typically enough to prevent it). Every visit to your site reads from the database, so a site with regular visitors stays awake. If it ever pauses, click **Resume project** in the dashboard (restorable for up to a year), or open your Hood once a week. Paid plans never pause.
- **Free-tier limits change.** Check https://supabase.com/pricing and Cloudflare's Pages limits page before relying on them. At the time of writing, Cloudflare Pages' free plan lists 500 builds a month; you will not use any in day-to-day editing, since content changes never trigger a build.
- **Backups:** use Advanced → Download backup now and then. Your blog posts and guestbook live in the database, so Supabase's own backup/export tools cover those.
- **Images in posts:** paste an image URL with the 🖼 button. To host images yourself, add a public bucket in Supabase **Storage** and use its URLs.
- **Vercel / Netlify instead of Cloudflare:** import the same GitHub repo, build command `npm run build`, output directory `dist`, and add the same two env variables.
