# Hireline — Landing Page

A 1-page landing site for an AI-powered direct-hiring platform connecting
employers with domestic helpers across countries. Plain **HTML + CSS +
vanilla JS** — no build step, no framework, no dependencies.

## Suggested name & tagline

**Hireline** — *"Hire domestic help directly. No agencies. No middlemen."*

(Used as a placeholder throughout the site — swap the logo text in
`index.html` and the `<title>` tag when you've picked a final name.)

## Project structure

```
landing/
├── index.html      # All page content & sections
├── styles.css       # All styling, design tokens, responsive rules
├── script.js        # Mobile nav, scroll-reveal, chat widget, form
├── vercel.json       # Static deployment config (optional but tidy)
└── README.md
```

That's it — 3 source files. No `node_modules`, no `package.json` required.

## Sections included

1. **Hero** — name, tagline, primary CTA, quick stats
2. **Problem** — why agency-based hiring is broken (4 cards)
3. **Solution** — the direct-connection pitch + visual matching diagram
4. **Features** — AI matching, direct chat, global hiring, verification, filters, zero commission
5. **How it works** — 4-step process with a connecting line
6. **CTA** — waitlist email capture (front-end only — see note below)
7. **Footer** — links + placeholder contact
8. **Chat icon** — top-right icon-only button that opens a placeholder chat panel

## Run locally

No installation needed. Any of these work:

**Option A — just open the file**
```bash
open index.html        # macOS
start index.html        # Windows
xdg-open index.html      # Linux
```

**Option B — local server (recommended, avoids font/CORS quirks)**
```bash
cd landing
python3 -m http.server 8000
# then visit http://localhost:8000
```

**Option C — VS Code Live Server extension**
Right-click `index.html` → "Open with Live Server".

## Deploy to Vercel

### Option 1 — Vercel CLI
```bash
npm install -g vercel
cd landing
vercel
```
Follow the prompts (link/create a project). Vercel auto-detects this as a
static site — no framework preset, no build command needed. Run `vercel --prod`
to push to production.

### Option 2 — Git + Vercel dashboard
1. Push this folder to a GitHub/GitLab/Bitbucket repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Other** (or "Static"). Leave build command empty,
   output directory as `.` (root) — Vercel will serve `index.html` directly.
4. Click **Deploy**. Done in under a minute.

### Option 3 — Drag and drop
Go to [vercel.com/new](https://vercel.com/new) and drag the `landing` folder
straight into the browser. No CLI, no Git required.

No environment variables, no API keys, no backend — this is a fully static
site, so there is nothing else to configure.

## Things to customize before launch

- **Name/branding**: replace "Hireline" in `index.html` (logo, `<title>`,
  meta description) and the footer copyright.
- **Waitlist form**: `script.js` currently just shows a confirmation message
  on submit — it doesn't send the email anywhere. Wire it up to a real
  service (e.g. a Vercel Serverless Function, Formspree, Mailchimp,
  Airtable, or your own API) by replacing the `submit` handler in
  `script.js`.
- **Chat widget**: the chat icon/panel is a static placeholder (inputs are
  disabled). Connect it to a real chat/AI provider when ready, or swap in a
  third-party widget script.
- **Email/contact**: update `hello@hireline.example` in the footer.
- **Favicon**: currently an inline emoji SVG — swap for a real logo file
  when you have one.

## Notes on the build choices

- **No framework**: keeps the deploy surface to 3 files with zero install
  step, avoiding any Vercel build-config issues.
- **Scroll-reveal is fail-safe**: all content is visible by default in the
  CSS. JavaScript only *arms* the fade-in animation after confirming it's
  running — so if a script fails to load for any reason, visitors still see
  full content, never a blank page.
- **Fonts**: Google Fonts (`Fraunces` for display headings, `Inter` for
  body text) loaded via CDN `<link>` tags — no local font files to manage.
- **Accessibility**: semantic landmarks (`header`, `main`, `footer`, `nav`),
  visible focus states, `prefers-reduced-motion` support, and alt/aria
  labels on icon-only buttons.
