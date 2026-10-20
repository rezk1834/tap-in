// Data model + migration. Old data (single phone, instagram/facebook/tiktok, reviews as a URL, links toggle) is upgraded automatically.
// Rule: normalizing never removes saved content. Layouts and visibility toggles only change what is displayed.
import { CAT_IDS, catOf } from './categories.js'
import { BUTTON_KINDS } from './buttons.js'
import { ACCENTS, BTN_SHAPES, LAYOUTS, LOGO_SHAPES, LOGO_SIZES } from './layouts.js'
import { normalizeFonts } from './fontLibrary.js'

function guessCategory(p) {
  const s = ((p.type || '') + ' ' + (p.name || '')).toLowerCase()
  if (/restaurant|مطعم/.test(s)) return 'restaurant'
  if (/caf[eé]|coffee|كافيه|قهوة/.test(s)) return 'cafe'
  if (/pharmac|صيدلية/.test(s)) return 'pharmacy'
  if (/clinic|عيادة/.test(s)) return 'clinic'
  if (/salon|beauty|صالون/.test(s)) return 'beauty'
  if (/supermarket|grocery|سوبر/.test(s)) return 'supermarket'
  return 'other'
}

const arr = (x) => (Array.isArray(x) ? x : [])
const str = (x) => (typeof x === 'string' ? x : '')
const on = (x) => x !== false
const oneOf = (v, list, d) => (list.some((x) => (Array.isArray(x) ? x[0] : x) === v) ? v : d)
// list items: only objects, each with its own visibility flag (default shown)
const items = (x) => arr(x).filter((o) => o && typeof o === 'object').map((o) => ({ ...o, show: on(o.show) }))
const withId = (x, i, pre) => ({ ...x, id: str(x.id) || pre + i })

// Section / field visibility. Every key can be switched off independently.
const DEFAULT_SHOW = {
  about: true, buttons: true, actions: true, socials: true, offers: true, menu: true, products: true, services: true,
  gallery: true, facts: true, reviews: true, visit: true,
  logo: true, cover: true, name: true, type: true, tagline: true, whatsapp: true, address: true, hours: true, directions: true,
}

export function normalizePlace(p) {
  const q = { ...p }
  q.category = CAT_IDS.includes(p.category) ? p.category : guessCategory(p)
  ;['name', 'nameAr', 'type', 'typeAr', 'tagline', 'taglineAr', 'about', 'aboutAr', 'whatsapp', 'address', 'addressAr', 'hours', 'hoursAr', 'mapLink', 'logo', 'cover']
    .forEach((k) => { q[k] = str(p[k]) })
  q.logoShape = oneOf(p.logoShape, LOGO_SHAPES, 'rounded')
  q.logoSize = oneOf(p.logoSize, LOGO_SIZES, 'l')
  q.accent = oneOf(p.accent, ACCENTS, 'blue')
  q.btnShape = oneOf(p.btnShape, BTN_SHAPES, 'rounded')
  // existing places keep a layout that shows everything they had; restaurants and cafés get the menu layout
  q.layout = LAYOUTS.some((l) => l.id === p.layout) ? p.layout : catOf(q.category).layout === 'menu' ? 'menu' : 'profile'
  q.orders = p.orders && typeof p.orders === 'object' && !Array.isArray(p.orders) ? p.orders : {}
  q.aliases = arr(p.aliases).filter(Boolean)

  const s = p.show && typeof p.show === 'object' ? p.show : {}
  q.show = { ...DEFAULT_SHOW, ...s }
  if (s.socials === undefined && s.links !== undefined) q.show.socials = on(s.links) // old "Links" toggle covered socials and phones
  delete q.show.links
  const legacyLinksOff = s.socials === undefined && s.links === false

  q.menuFiles = arr(p.menuFiles).concat(!Array.isArray(p.menuFiles) && p.menuFile ? [p.menuFile] : [])
    .filter((f) => f && (f.data || f.url) && f.type).map((f) => ({ ...f, show: on(f.show) }))
  delete q.menuFile

  const phones = Array.isArray(p.phones) ? p.phones : p.phone ? [{ label: '', number: p.phone }] : []
  q.phones = phones.filter((x) => x && typeof x === 'object').map((x) => ({
    ...x, label: str(x.label), labelAr: str(x.labelAr), number: str(x.number), show: x.show === undefined ? !legacyLinksOff : on(x.show),
  }))
  q.emails = items(p.emails).map((x) => ({ ...x, label: str(x.label), labelAr: str(x.labelAr), email: str(x.email) }))

  let socials = Array.isArray(p.socials) ? p.socials : []
  if (!Array.isArray(p.socials)) ['instagram', 'facebook', 'tiktok'].forEach((k) => { if (p[k]) socials.push({ platform: k, url: p[k] }) })
  q.socials = socials.filter((x) => x && typeof x === 'object').map((x) => ({ ...x, platform: str(x.platform) || 'other', url: str(x.url), show: on(x.show) }))

  q.buttons = items(p.buttons).map((x, i) => ({
    ...withId(x, i, 'b'),
    kind: BUTTON_KINDS.some((k) => k[0] === x.kind) ? x.kind : 'link',
    label: str(x.label), labelAr: str(x.labelAr), value: str(x.value),
    icon: str(x.icon) || 'auto', style: x.style === 'outline' ? 'outline' : 'primary',
  }))
  q.offers = items(p.offers)
  q.menu = items(p.menu)
  q.products = items(p.products).map((x, i) => withId(x, i, 'p'))
  q.services = items(p.services).map((x, i) => withId(x, i, 's'))
  q.gallery = items(p.gallery).map((x, i) => withId(x, i, 'g'))
  q.facts = items(p.facts).map((x, i) => withId(x, i, 'f'))
  q.texts = items(p.texts).map((x, i) => withId(x, i, 't'))
  q.reviewLink = str(p.reviewLink) || (typeof p.reviews === 'string' ? p.reviews : '')
  q.reviews = items(p.reviews)

  delete q.phone; delete q.instagram; delete q.facebook; delete q.tiktok
  return q
}

// Every uploaded image or file a place points to (used to clean up unused files in storage)
export const imagesOf = (p) => [
  p.logo, p.cover,
  ...p.menuFiles.map((f) => f.url),
  ...p.gallery.map((g) => g.url),
  ...p.products.map((x) => x.img),
  ...p.services.map((x) => x.img),
].filter(Boolean)

// A blank place with every field present
export const newPlace = (id, category = 'other') =>
  normalizePlace({ id, category, layout: catOf(category).layout, name: 'New place', nameAr: 'مكان جديد' })

// Official TapinEG accounts shown site-wide (footer and contact button)
export const SITE_SOCIALS = [
  { platform: 'whatsapp', url: '', enabled: true },
  { platform: 'x', url: 'https://x.com/tapineg', enabled: true },
  { platform: 'facebook', url: 'https://www.facebook.com/tapineg', enabled: true },
  { platform: 'instagram', url: 'https://www.instagram.com/tapin.eg', enabled: true },
  { platform: 'tiktok', url: 'https://www.tiktok.com/@tapineg', enabled: true },
]

function normalizeSite(s = {}) {
  const saved = Array.isArray(s.socials) ? s.socials : []
  const socials = SITE_SOCIALS.map((d) => {
    const f = saved.find((x) => x && x.platform === d.platform)
    return f ? { platform: d.platform, url: d.platform === 'whatsapp' ? '' : typeof f.url === 'string' ? f.url : d.url, enabled: f.enabled !== false } : { ...d }
  })
  return { ...s, whatsapp: s.whatsapp ?? '', socials, fonts: normalizeFonts(s.fonts) }
}

const HOSTS = { x: ['x.com', 'twitter.com'], facebook: ['facebook.com', 'fb.com'], instagram: ['instagram.com'], tiktok: ['tiktok.com'] }
const NAMES = { x: 'X', facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok' }

// Returns an error message, or '' when the link is valid for that platform
export function validateSocial(platform, value) {
  let u
  try { u = new URL(value) } catch { return 'Enter a full link starting with https://' }
  if (!/^https?:$/.test(u.protocol)) return 'The link must start with https://'
  const h = u.hostname.toLowerCase()
  if (!(HOSTS[platform] || []).some((d) => h === d || h.endsWith('.' + d))) return `This is not a valid ${NAMES[platform]} link (expected ${HOSTS[platform][0]}).`
  if (u.pathname.replace(/\//g, '') === '') return `Add the account name, e.g. https://${HOSTS[platform][0]}/yourname`
  return ''
}

export function normalize(d) {
  return { ...d, site: normalizeSite(d.site), places: (d.places || []).map(normalizePlace) }
}

// ---- page address (URL slug) helpers ----
const RESERVED = ['admin', 'place']
export function slugify(text) {
  return String(text || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')
}
export function validateSlug(slug, places, index) {
  if (!slug) return 'The address cannot be empty.'
  if (!/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(slug)) return 'Use letters, numbers and single hyphens only.'
  if (RESERVED.includes(slug)) return 'This address is reserved. Choose another.'
  if (places.some((p, i) => i !== index && (p.id === slug || (p.aliases || []).includes(slug)))) return 'Another place already uses this address.'
  return ''
}
export const uniqueSlug = (base, places, idx = -1) => {
  let s = base, n = 2
  while (places.some((p, i) => i !== idx && (p.id === s || p.aliases.includes(s)))) s = base + '-' + n++
  return s
}
export const autoSlug = (name, places, idx) => uniqueSlug(slugify(name) || 'place', places, idx)
