import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts (replaces the Google Fonts CDN <link> tags) so the app
// has zero external network dependencies and works fully offline as a PWA.
// Only the Latin subset is imported for Inter/Lexend (the bulk of the UI is
// English-only) to keep the service worker's precache small instead of
// shipping every unicode range — Cyrillic text in those falls back to the
// OS's default sans-serif, which is an accepted trade-off since it's still
// legible. Playfair Display (the in-game level title only) imports BOTH
// latin and cyrillic subsets, since it's a much more distinctive serif and
// falling back to a generic system serif for Russian titles would look like
// a completely different, uncoordinated font next to the Latin one.
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/inter/latin-800.css'
import '@fontsource/lexend/latin-500.css'
import '@fontsource/lexend/latin-600.css'
import '@fontsource/lexend/latin-700.css'
import '@fontsource/lexend/latin-800.css'
import '@fontsource/playfair-display/latin-600.css'
import '@fontsource/playfair-display/latin-700.css'
import '@fontsource/playfair-display/latin-800.css'
import '@fontsource/playfair-display/cyrillic-600.css'
import '@fontsource/playfair-display/cyrillic-700.css'
import '@fontsource/playfair-display/cyrillic-800.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
