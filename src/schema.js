// Data model + migration. Old data (phone/instagram/facebook/tiktok/reviews as a URL) is upgraded automatically.
export const CATS = ['restaurant', 'cafe', 'clinic', 'other']

function guessCategory(p) {
  const s = ((p.type || '') + ' ' + (p.name || '')).toLowerCase()
  if (/restaurant|مطعم/.test(s)) return 'restaurant'
  if (/caf[eé]|coffee|كافيه|قهوة/.test(s)) return 'cafe'
  if (/clinic|عيادة/.test(s)) return 'clinic'
  return 'other'
}

export function normalizePlace(p) {
  const q = { ...p }
  q.category = CATS.includes(p.category) ? p.category : guessCategory(p)
  q.logo = typeof p.logo === 'string' ? p.logo : ''
  q.menuFile = p.menuFile && p.menuFile.data ? p.menuFile : null
  q.show = { menu: true, offers: true, links: true, reviews: true, ...(p.show || {}) }
  q.phones = Array.isArray(p.phones) ? p.phones : p.phone ? [{ label: '', number: p.phone }] : []
  if (Array.isArray(p.socials)) q.socials = p.socials
  else {
    q.socials = []
    ;['instagram', 'facebook', 'tiktok'].forEach((k) => { if (p[k]) q.socials.push({ platform: k, url: p[k] }) })
  }
  if (Array.isArray(p.reviews)) q.reviewLink = p.reviewLink || ''
  else { q.reviewLink = p.reviewLink || (typeof p.reviews === 'string' ? p.reviews : ''); q.reviews = [] }
  q.offers = Array.isArray(p.offers) ? p.offers : []
  q.menu = Array.isArray(p.menu) ? p.menu : []
  delete q.phone; delete q.instagram; delete q.facebook; delete q.tiktok
  return q
}

// Official TapinEG accounts shown site-wide (footer and contact button)
export const SITE_SOCIALS = [
  { platform: 'x', url: 'https://x.com/tapineg', enabled: true },
  { platform: 'facebook', url: 'https://www.facebook.com/tapineg', enabled: true },
  { platform: 'instagram', url: 'https://www.instagram.com/tapin.eg', enabled: true },
  { platform: 'tiktok', url: 'https://www.tiktok.com/@tapineg', enabled: true },
]

function normalizeSite(s = {}) {
  const saved = Array.isArray(s.socials) ? s.socials : []
  const socials = SITE_SOCIALS.map((d) => {
    const f = saved.find((x) => x && x.platform === d.platform)
    return f ? { platform: d.platform, url: typeof f.url === 'string' ? f.url : d.url, enabled: f.enabled !== false } : { ...d }
  })
  return { ...s, whatsapp: s.whatsapp ?? '', socials }
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
