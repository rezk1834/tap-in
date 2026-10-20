import { isUrl } from './files.js'

export const BUTTON_KINDS = [
  ['link', 'Web link'],
  ['phone', 'Phone call'],
  ['whatsapp', 'WhatsApp'],
  ['email', 'Email'],
  ['map', 'Map / directions'],
]
export const BUTTON_ICONS = ['auto', 'none', 'link', 'phone', 'whatsapp', 'mail', 'map', 'calendar', 'cart', 'download', 'star', 'menu', 'gift', 'tag', 'clock', 'user', 'heart', 'globe']
export const KIND_ICON = { link: 'link', phone: 'phone', whatsapp: 'whatsapp', email: 'mail', map: 'map' }

const SHOP = ['retail', 'supermarket', 'fashion', 'electronics']
// Suggested business-specific action buttons (the dashboard offers the ones matching the category first)
export const BUTTON_PRESETS = [
  { en: 'Order online', ar: 'اطلب أونلاين', kind: 'link', icon: 'cart', cats: ['restaurant', 'cafe', 'supermarket', 'pharmacy', ...SHOP] },
  { en: 'Order via WhatsApp', ar: 'اطلب عبر واتساب', kind: 'whatsapp', icon: 'whatsapp', cats: ['restaurant', 'cafe', 'pharmacy', ...SHOP] },
  { en: 'Book a table', ar: 'احجز طاولة', kind: 'whatsapp', icon: 'calendar', cats: ['restaurant', 'cafe'] },
  { en: 'Download the menu', ar: 'حمّل المنيو', kind: 'link', icon: 'download', cats: ['restaurant', 'cafe'] },
  { en: 'Shop online', ar: 'تسوّق أونلاين', kind: 'link', icon: 'cart', cats: SHOP },
  { en: 'Download the catalog', ar: 'حمّل الكتالوج', kind: 'link', icon: 'download', cats: SHOP },
  { en: 'Home delivery', ar: 'توصيل للمنزل', kind: 'whatsapp', icon: 'cart', cats: ['supermarket', 'pharmacy', 'restaurant', 'cafe'] },
  { en: 'Send your prescription', ar: 'أرسل الروشتة', kind: 'whatsapp', icon: 'download', cats: ['pharmacy'] },
  { en: 'Book an appointment', ar: 'احجز موعدًا', kind: 'whatsapp', icon: 'calendar', cats: ['clinic', 'beauty', 'services'] },
  { en: 'Request a quote', ar: 'اطلب عرض سعر', kind: 'whatsapp', icon: 'tag', cats: ['services', 'electronics', 'other'] },
  { en: 'Visit our website', ar: 'زوروا موقعنا', kind: 'link', icon: 'globe', cats: [] },
  { en: 'Email us', ar: 'راسلنا', kind: 'email', icon: 'mail', cats: [] },
  { en: 'Call us', ar: 'اتصل بنا', kind: 'phone', icon: 'phone', cats: [] },
  { en: 'Find us on the map', ar: 'موقعنا على الخريطة', kind: 'map', icon: 'map', cats: [] },
]

export const waHref = (n) => {
  const d = String(n || '').replace(/\D/g, '')
  return d.length >= 8 ? 'https://wa.me/' + d : ''
}
export const mapsHref = (p) =>
  isUrl(p.mapLink) ? p.mapLink.trim() : (p.address || '').trim() ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.address.trim()) : ''

// Where a custom button goes. Empty string = not valid yet, so the button stays off the public page.
export function buttonHref(b, p) {
  const v = String(b.value || '').trim()
  switch (b.kind) {
    case 'phone': {
      const n = v || ((p.phones || []).find((x) => x.number && x.number.trim()) || {}).number || ''
      const d = n.replace(/[^\d+]/g, '')
      return d.replace(/\D/g, '').length >= 3 ? 'tel:' + d : ''
    }
    case 'whatsapp': return isUrl(v) ? v : waHref(v || p.whatsapp)
    case 'email': return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? 'mailto:' + v : ''
    case 'map': return isUrl(v) ? v : v ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(v) : mapsHref(p)
    default: return isUrl(v) ? v : ''
  }
}
