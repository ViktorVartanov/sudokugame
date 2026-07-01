# Sudoku Prime

A premium, single-player Sudoku game built with React, TypeScript, Vite, and Tailwind CSS. Ten hand-tuned difficulty levels, a from-scratch puzzle generator/solver, notes, hints, achievements, a polished animated UI — and a fully installable, offline-first Progressive Web App.

## Features

- **10 difficulty levels** from Beginner to Grandmaster, each with its own clue count (50 → 24 givens).
- **Unique puzzles every time** — a bitmask backtracking generator digs holes into a randomly generated solved grid while a solution-counting solver guarantees every puzzle has exactly one solution. All of this runs client-side, so puzzles are generated with **zero server requests**.
- **Notes mode** for pencil-marking candidates, with automatic note cleanup when a correct digit is placed.
- **Hints** (3 per puzzle) that reveal a correct cell without counting as a mistake.
- **Mistake counter**, **timer**, **pause/resume**, and **restart** (resets the current puzzle back to its givens).
- **Undo** history and keyboard support (digits, arrows, `N` for notes, `P`/space for pause, `Z` for undo).
- **Progress saved to `localStorage`** — best times, stars, and completion per level, plus your current in-progress puzzle is restored automatically if you leave and come back.
- **6 achievements**: First Victory, Flawless Victory, Speed Demon, Grandmaster Slayer, Completionist, and Dedicated Solver.
- **Victory screen** with confetti, star rating, stats, and newly unlocked achievements.
- **A dedicated Grandmaster finale** — completing the hardest level triggers a distinct full-screen celebration with a longer fireworks sequence and a summary of your overall journey (total stars, time played, achievements).
- **Stats screen** with an overview of levels completed, total wins, time played, stars earned, perfect solves, and a per-level breakdown — accessible from the header's chart icon.
- **Light/dark theme**, staggered entrance animations, smooth view transitions, and a fully responsive layout for desktop and mobile.
- **Installable Progressive Web App** — works fully offline after the first load, installs to a phone's home screen (standalone, no browser UI), and scores **100/100** on Lighthouse's PWA checklist. See [Progressive Web App](#progressive-web-app) below for details.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for tooling and dev server
- [Tailwind CSS v4](https://tailwindcss.com/) for styling
- [Zustand](https://github.com/pmndrs/zustand) for state management (with `localStorage` persistence)
- [canvas-confetti](https://github.com/catdad/canvas-confetti) for the victory celebration
- [lucide-react](https://lucide.dev/) for icons
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) for the service worker, manifest, and offline caching
- [@fontsource/inter](https://fontsource.org/) / [@fontsource/lexend](https://fontsource.org/) — self-hosted fonts (no external font requests, required for full offline support)

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm (bundled with Node.js)

### Install and run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically [http://localhost:5173](http://localhost:5173)).

### Other scripts

```bash
npm run build     # Type-check and build a production bundle into dist/
npm run preview   # Serve the production build locally (http://localhost:4173)
npm run lint      # Run Oxlint
```

> **Note:** the service worker is intentionally disabled during `npm run dev` (hot-reload and service-worker caching don't mix well). To test installability, offline mode, or the "Offline ready" toast, always use `npm run build && npm run preview`.

## Project structure

```
public/
  icons/                    # 192x192, 512x512, and maskable 512x512 PNG app icons
  apple-touch-icon.png      # 180x180 icon for iOS "Add to Home Screen"
  favicon.svg               # Source brand icon (also the browser tab favicon)
src/
  components/
    common/       # Reusable primitives: Button, Modal, StarRating, PwaStatus (offline/update toasts)
    layout/        # Header, ThemeToggle
    home/          # Level select screen, level cards, achievements panel
    game/          # Board, cells, number pad, toolbar, victory modal, pause overlay, Grandmaster finale
    stats/         # Stats screen and stat cards
  hooks/           # useTimer, useKeyboardInput
  lib/             # Sudoku solver/generator, difficulty config, achievements, storage, utils
  store/           # Zustand stores: game, progress, achievements, settings
  types/           # Shared TypeScript types
  vite-env.d.ts    # Ambient types for Vite + the vite-plugin-pwa React hook
vite.config.ts     # Vite config, including the VitePWA (manifest + service worker) setup
```

### How puzzle generation works

1. `generateFullGrid` fills an empty 9x9 grid via randomized backtracking to produce a complete, valid solution.
2. `generatePuzzle` removes cells one at a time in random order. After each removal, `countSolutions` (a bitmask solver with an early-exit limit) verifies the puzzle still has **exactly one** solution — if not, the cell is put back.
3. This continues until the target clue count for the chosen difficulty is reached, guaranteeing every generated puzzle is solvable and uniquely so.

Because puzzles are generated and solved entirely in the browser (no API, no JSON data files fetched over the network), the game has **no server dependency at all** — which is what makes full offline play straightforward.

## Progressive Web App

Sudoku Prime is a fully installable, offline-first PWA, built with [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) (which wraps [Workbox](https://developer.chrome.com/docs/workbox/) for the service worker).

### How offline support works

1. On first visit, the browser loads the app normally (this first load needs a network connection, same as installing any app).
2. A service worker registers in the background and **precaches every build asset** — JS, CSS, the HTML shell, self-hosted font files (`.woff2`), and all icons.
3. Once precaching finishes, an **"Offline ready"** toast appears (bottom of the requirements list, item 9) confirming the app is now fully cached.
4. From then on, every asset is served from the Cache Storage API first. Since puzzle generation/solving is pure client-side JavaScript (no network calls), gameplay is **100% identical online or offline** — new puzzles, notes, hints, timers, achievements, and stats all continue to work with the network fully disabled.
5. All game state (progress, achievements, settings, in-progress puzzle) lives in `localStorage` via Zustand's `persist` middleware — already local-only, so it was unaffected by this change.
6. If a new version of the app is deployed, the updated service worker downloads and precaches in the background, then a **"New version available"** toast lets you reload on your own terms (it never force-reloads under you).

### Files changed or added for the PWA conversion

| File | Why |
|---|---|
| `vite.config.ts` | Added the `VitePWA` plugin: the web app manifest (name, icons, `display: standalone`, `orientation: portrait`, theme/background colors), and the Workbox `generateSW` config that precaches all build output (`globPatterns`). `injectRegister: null` because we register the service worker ourselves (see `PwaStatus.tsx`) instead of using the plugin's auto-injected script, so we can drive custom UI. |
| `src/components/common/PwaStatus.tsx` | New component. Calls the `useRegisterSW` hook from `virtual:pwa-register/react` to register the service worker and render the "Offline ready" / "Update available" toasts (requirement 9). Also polls `registration.update()` hourly so long-lived tabs still get update prompts. |
| `src/App.tsx` | Mounts `<PwaStatus />` once, outside the view-switch container, so its toast state survives navigation between Home/Game/Stats. |
| `src/vite-env.d.ts` | New file. Adds the ambient TypeScript types for `virtual:pwa-register/react` (via `/// <reference types="vite-plugin-pwa/react" />`) so `useRegisterSW` type-checks. |
| `src/main.tsx` | Replaced the two Google Fonts `<link>` tags with `@fontsource/*` CSS imports (self-hosted font files). This removes the app's only external network dependency, so it can precache and serve fonts itself instead of depending on `fonts.gstatic.com` being reachable. |
| `index.html` | Removed the Google Fonts `<link>`/`<preconnect>` tags (fonts are now self-hosted). Added the Apple-specific meta tags iOS Safari requires for standalone (no browser chrome) launch: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`, and `<link rel="apple-touch-icon">`. The `<link rel="manifest">` tag itself is auto-injected by `vite-plugin-pwa` at build time, so it isn't in the source file. |
| `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | New app icons rasterized from the existing `favicon.svg` brand mark, at the sizes the web app manifest requires. The maskable variant was verified to keep its artwork inside the safe zone when cropped to a circle (as Android's adaptive icon masks do). |
| `public/apple-touch-icon.png` | New 180×180 icon specifically for iOS's home screen (iOS doesn't support SVG or the web manifest's icon list for this). |
| `package.json` | Added `vite-plugin-pwa` (dev dependency) and `@fontsource/inter` / `@fontsource/lexend` (dependencies). |

Nothing about the existing game architecture changed — no store, component, or game-logic file was touched beyond the two above, which are purely about fonts/mounting.

### Generated at build time (not committed as source)

Running `npm run build` generates these inside `dist/` — they don't exist in `src/` or `public/` because `vite-plugin-pwa` produces them from the config in `vite.config.ts`:

- `dist/manifest.webmanifest` — the web app manifest (this is the PWA's `manifest.json`; Vite's plugin uses the `.webmanifest` extension, which is the same JSON format and works identically).
- `dist/sw.js` — the generated service worker.
- `dist/workbox-*.js` — the Workbox runtime the service worker uses.

### Testing offline mode locally

```bash
npm run build
npm run preview
```

Open [http://localhost:4173](http://localhost:4173), wait for the "Offline ready" toast, then either:
- **Chrome DevTools** → Network tab → set throttling to "Offline", or
- **DevTools → Application → Service Workers** → check "Offline"

...and reload the page. The app (including generating a brand-new puzzle) keeps working normally.

### Lighthouse PWA score

This app was audited with Lighthouse's PWA checklist and **scores 100/100**, passing every automated check: installable manifest, service worker controlling the page, a themed address bar, correct viewport configuration, and a valid maskable icon.

> Note: Google removed the scored "PWA" category from Lighthouse itself in recent Chrome/Lighthouse versions (12+) in favor of manual DevTools panels. To get an actual numeric score, audit with `npx lighthouse@11 <url> --only-categories=pwa` — the underlying installability requirements haven't changed, only whether Lighthouse's CLI still reports a category score for them.

### Regenerating icons

If you change the brand mark in `public/favicon.svg`, regenerate the PNGs (any SVG-to-PNG tool works; the originals here were rendered with a headless browser at exact pixel sizes): 192×192 and 512×512 for `public/icons/`, one more 512×512 for the maskable variant (keep the artwork within the centered 80%-diameter "safe zone" so adaptive icon masks don't crop it), and 180×180 for `public/apple-touch-icon.png`.

## Deploying to Vercel

1. Push this project to a GitHub/GitLab/Bitbucket repository (or use the Vercel CLI directly from this folder).
2. **Dashboard route:** go to [vercel.com/new](https://vercel.com/new), import the repository. Vercel auto-detects Vite — no config needed:
   - Build command: `npm run build`
   - Output directory: `dist`
3. **CLI route** (from this project folder):
   ```bash
   npm install -g vercel   # one-time
   vercel                  # follow the prompts to link/create a project
   vercel --prod           # deploy to your production URL
   ```
4. Vercel serves everything over HTTPS by default, which is required for service workers to register (the only exception is `localhost`, which is why local testing works without HTTPS). No extra configuration is needed for the manifest, service worker, or icons — they're static files inside `dist/` and Vercel serves them as-is.

## Installing on iPhone (Safari)

1. Open the deployed URL in **Safari** on the iPhone (must be Safari — other iOS browsers can't add PWAs to the home screen with standalone mode).
2. Tap the **Share** icon (square with an upward arrow) in the toolbar.
3. Scroll down and tap **"Add to Home Screen"**.
4. Confirm the name (defaults to "Sudoku Prime") and tap **Add**.
5. Launch the app from the new home screen icon — it opens in **standalone mode** (no Safari address bar or tab UI), using the app icon and splash screen generated from the manifest.

Once installed, the app continues to work offline exactly as it does in the browser, since it's the same cached service worker and assets.

## License

This project is provided as-is for personal or educational use.
