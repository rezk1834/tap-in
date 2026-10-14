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

export function normalize(d) {
  return { ...d, site: d.site || { whatsapp: '' }, places: (d.places || []).map(normalizePlace) }
}
