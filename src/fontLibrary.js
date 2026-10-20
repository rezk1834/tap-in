// Font library. Every font is a Google Font, loaded only when it is actually selected (or while the admin browses the library).
// script: 'ar' = Arabic letters only, 'latin' = Latin only, 'both' = Arabic and Latin in one family.
// use: the roles the font suits best.
export const ROLES = [
  ['heading', 'Headings', 'Page titles and section titles'],
  ['body', 'Body text', 'Descriptions, menu items, reviews'],
  ['button', 'Buttons', 'Action buttons and links'],
  ['label', 'Labels and captions', 'Small text: categories, hints, prices'],
  ['nav', 'Navigation', 'Header and language / theme controls'],
]
const ALL = ['heading', 'body', 'button', 'label', 'nav']
const F = (name, script, kind, use, note) => ({ name, script, kind, use, note })

export const FONTS = [
  // Arabic + Latin in one family
  F('Cairo', 'both', 'sans', ALL, 'Clean and modern. Very readable at every size. A great all-rounder.'),
  F('Tajawal', 'both', 'sans', ALL, 'Light, friendly and compact. Excellent on phones and for menus.'),
  F('IBM Plex Sans Arabic', 'both', 'sans', ['body', 'label', 'nav', 'button', 'heading'], 'Neutral and highly legible. Matches IBM Plex Sans.'),
  F('Readex Pro', 'both', 'sans', ['body', 'label', 'nav', 'button'], 'Designed for readability, with generous letter spacing.'),
  F('Alexandria', 'both', 'sans', ['heading', 'button', 'nav'], 'Wide and geometric. Good for headings and buttons.'),
  F('Rubik', 'both', 'sans', ['heading', 'button', 'nav', 'label'], 'Soft rounded corners with a friendly tone.'),
  F('Vazirmatn', 'both', 'sans', ['body', 'label', 'nav'], 'Calm and clear for longer text.'),
  F('Changa', 'both', 'sans', ['heading', 'button'], 'Strong and punchy. Keep it to headings and buttons.'),
  F('Baloo Bhaijaan 2', 'both', 'display', ['heading', 'button'], 'Rounded and playful. Suits cafés and kids’ brands.'),
  F('El Messiri', 'both', 'display', ['heading'], 'Elegant, with a classic Arabic character. Headings only.'),
  F('Reem Kufi', 'both', 'display', ['heading', 'nav'], 'Geometric Kufi. Strong headings and short navigation labels.'),
  F('Lemonada', 'both', 'display', ['heading'], 'Warm and informal. Headings only.'),
  F('Amiri', 'both', 'serif', ['body', 'heading'], 'Classical Naskh book style. Elegant for headings and long text.'),
  F('Markazi Text', 'both', 'serif', ['body', 'heading'], 'Compact Naskh serif for editorial text.'),
  // Arabic only
  F('Noto Sans Arabic', 'ar', 'sans', ALL, 'Very neutral and complete. A safe choice for body text.'),
  F('Noto Kufi Arabic', 'ar', 'sans', ['heading', 'button', 'nav', 'label'], 'Clear Kufi style. Strong headings and buttons.'),
  F('Noto Naskh Arabic', 'ar', 'serif', ['body', 'heading'], 'Traditional Naskh for comfortable reading.'),
  F('Almarai', 'ar', 'sans', ALL, 'Simple and light, built for screens.'),
  F('Mada', 'ar', 'sans', ['body', 'label', 'nav', 'button'], 'Clean, compact interface font.'),
  // Latin only
  F('Inter', 'latin', 'sans', ALL, 'The standard screen font. Excellent legibility at small sizes.'),
  F('IBM Plex Sans', 'latin', 'sans', ALL, 'Neutral and professional. Matches IBM Plex Sans Arabic.'),
  F('Noto Sans', 'latin', 'sans', ALL, 'Plain and very readable. Matches Noto Sans Arabic.'),
  F('Roboto', 'latin', 'sans', ALL, 'Familiar, friendly and clear.'),
  F('Open Sans', 'latin', 'sans', ['body', 'label', 'nav', 'button'], 'Open and easy on the eyes for body text.'),
  F('Lato', 'latin', 'sans', ['body', 'label', 'nav', 'button', 'heading'], 'Warm and stable.'),
  F('Poppins', 'latin', 'sans', ['heading', 'button', 'nav'], 'Geometric and bold. Good headings and buttons.'),
  F('Montserrat', 'latin', 'sans', ['heading', 'button', 'nav'], 'Wide and confident. Good for headings.'),
  F('Nunito', 'latin', 'sans', ['body', 'heading', 'button', 'label'], 'Rounded and friendly.'),
  F('DM Sans', 'latin', 'sans', ALL, 'Low-contrast geometric sans. Modern and clean.'),
  F('Work Sans', 'latin', 'sans', ['body', 'label', 'nav', 'heading'], 'Practical and clear.'),
  F('Manrope', 'latin', 'sans', ['heading', 'body', 'button', 'nav'], 'Modern and slightly technical.'),
  F('Source Sans 3', 'latin', 'sans', ['body', 'label', 'nav'], 'Designed for user interfaces and long reading.'),
  F('Lora', 'latin', 'serif', ['body', 'heading'], 'A balanced, readable serif.'),
  F('Merriweather', 'latin', 'serif', ['body', 'heading'], 'A sturdy serif made for reading on screens.'),
  F('Playfair Display', 'latin', 'serif', ['heading'], 'High-contrast and elegant. Headings only.'),
]
export const FONT_BY = Object.fromEntries(FONTS.map((f) => [f.name, f]))
export const supports = (f, script) => !!f && (f.script === 'both' || f.script === script) // script: 'ar' | 'latin'

const all = (ar, en) => Object.fromEntries(ALL.map((r) => [r, { ar, en }]))
const mix = (h, b) => ({ heading: h, body: b, button: h, label: b, nav: h })

// Ready-made Arabic + English pairings
export const PAIRINGS = [
  { id: 'cairo-inter', name: 'Cairo + Inter', desc: 'Clean, modern and very readable. The default.', roles: all('Cairo', 'Inter') },
  { id: 'plex', name: 'IBM Plex Sans Arabic + IBM Plex Sans', desc: 'A matched family. Neutral, sharp and professional.', roles: all('IBM Plex Sans Arabic', 'IBM Plex Sans') },
  { id: 'tajawal-poppins', name: 'Tajawal + Poppins and Open Sans', desc: 'Friendly headings with calm body text. Good for shops and cafés.', roles: mix({ ar: 'Tajawal', en: 'Poppins' }, { ar: 'Tajawal', en: 'Open Sans' }) },
  { id: 'kufi-montserrat', name: 'Noto Kufi + Montserrat headings, Noto Sans body', desc: 'Strong Kufi headings over a neutral body. Corporate and clear.', roles: mix({ ar: 'Noto Kufi Arabic', en: 'Montserrat' }, { ar: 'Noto Sans Arabic', en: 'Noto Sans' }) },
  { id: 'readex', name: 'Readex Pro (Arabic and Latin)', desc: 'One family for everything, tuned for readability.', roles: all('Readex Pro', 'Readex Pro') },
  { id: 'almarai-roboto', name: 'Almarai + Roboto', desc: 'Light and simple. Fast and friendly on phones.', roles: all('Almarai', 'Roboto') },
  { id: 'alexandria-dm', name: 'Alexandria + DM Sans headings, IBM Plex body', desc: 'Wide modern headings with a quiet body font.', roles: mix({ ar: 'Alexandria', en: 'DM Sans' }, { ar: 'IBM Plex Sans Arabic', en: 'DM Sans' }) },
  { id: 'elegant', name: 'El Messiri + Playfair Display headings, Naskh + Lora body', desc: 'Elegant and classic. Good for fashion, beauty and restaurants.', roles: mix({ ar: 'El Messiri', en: 'Playfair Display' }, { ar: 'Noto Naskh Arabic', en: 'Lora' }) },
  { id: 'classic', name: 'Amiri + Lora', desc: 'A book-like serif pairing for a traditional feel.', roles: all('Amiri', 'Lora') },
  { id: 'vazir-inter', name: 'Vazirmatn + Inter', desc: 'Calm, even and easy to read in long paragraphs.', roles: all('Vazirmatn', 'Inter') },
]
export const DEFAULT_ROLES = PAIRINGS[0].roles

export const rolesEqual = (a, b) => ALL.every((r) => a[r] && b[r] && a[r].ar === b[r].ar && a[r].en === b[r].en)
export const activePairing = (roles) => PAIRINGS.find((p) => rolesEqual(p.roles, roles)) || null

// CSS font-family value for a role. The Latin font is listed first, so Latin letters and digits use it,
// and Arabic letters (which it does not contain) fall through to the Arabic font.
export function stackOf(cfg) {
  const en = FONT_BY[cfg.en], ar = FONT_BY[cfg.ar]
  const names = [...new Set([en && en.name, ar && ar.name].filter(Boolean))].map((n) => `"${n}"`)
  const serif = (en && en.kind === 'serif') || (!en && ar && ar.kind === 'serif')
  names.push(serif ? 'Georgia, "Times New Roman", serif' : 'system-ui, "Segoe UI", Tahoma, sans-serif')
  return names.join(', ')
}

// Always returns a complete, valid fonts object (unknown or wrong-script fonts fall back to the default)
export function normalizeFonts(f) {
  const roles = {}
  ALL.forEach((r) => {
    const given = (f && f.roles && f.roles[r]) || {}
    roles[r] = {
      ar: supports(FONT_BY[given.ar], 'ar') ? given.ar : DEFAULT_ROLES[r].ar,
      en: supports(FONT_BY[given.en], 'latin') ? given.en : DEFAULT_ROLES[r].en,
    }
  })
  return { roles }
}

export const googleHref = (name) => `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, '+')}:wght@400;700&display=swap`

// Adds one stylesheet link per family (once). A failing family never affects the others.
export function loadFont(name) {
  if (typeof document === 'undefined' || !FONT_BY[name]) return
  if (document.querySelector(`link[data-font="${name}"]`)) return
  const l = document.createElement('link')
  l.rel = 'stylesheet'; l.href = googleHref(name); l.dataset.font = name
  document.head.appendChild(l)
}
