import { isUrl } from './files.js'

// A "section" is a block of the public page. Layouts decide which sections they display and in what default order.
// The content behind every section always stays saved on the place, whatever the layout.
export const SECTIONS = [
  { id: 'about', en: 'About', ar: 'نبذة' },
  { id: 'buttons', en: 'Custom buttons', ar: 'أزرار مخصصة' },
  { id: 'actions', en: 'Contact buttons', ar: 'أزرار التواصل' },
  { id: 'socials', en: 'Social media links', ar: 'روابط التواصل' },
  { id: 'offers', en: 'Offers', ar: 'العروض' },
  { id: 'menu', en: 'Menu', ar: 'المنيو' },
  { id: 'products', en: 'Products', ar: 'المنتجات' },
  { id: 'services', en: 'Services', ar: 'الخدمات' },
  { id: 'gallery', en: 'Gallery', ar: 'المعرض' },
  { id: 'facts', en: 'Business info', ar: 'معلومات' },
  { id: 'texts', en: 'Custom text sections', ar: 'أقسام نصية' },
  { id: 'reviews', en: 'Reviews', ar: 'التقييمات' },
  { id: 'visit', en: 'Address and hours', ar: 'العنوان والمواعيد' },
]

export const LAYOUTS = [
  {
    id: 'profile', en: 'Business profile', ar: 'ملف النشاط',
    descEn: 'A clean all-round page. Shows every kind of content, so nothing is left out.',
    sections: ['actions', 'socials', 'about', 'buttons', 'offers', 'menu', 'products', 'services', 'gallery', 'facts', 'texts', 'reviews', 'visit'],
  },
  {
    id: 'links', en: 'Linktree style', ar: 'صفحة روابط',
    descEn: 'A narrow profile with big link buttons. Best for social media bios and QR cards.',
    sections: ['about', 'buttons', 'actions', 'socials', 'texts', 'facts', 'gallery', 'offers', 'visit'],
  },
  {
    id: 'menu', en: 'Restaurant & digital menu', ar: 'مطعم ومنيو رقمي',
    descEn: 'The menu comes first: items grouped by section, menu photos and PDFs, offers.',
    sections: ['actions', 'menu', 'offers', 'about', 'buttons', 'gallery', 'facts', 'texts', 'reviews', 'socials', 'visit'],
  },
  {
    id: 'catalog', en: 'Retail store & catalog', ar: 'متجر وكتالوج',
    descEn: 'A product grid with photos, prices and links, plus offers and store info.',
    sections: ['actions', 'products', 'offers', 'about', 'buttons', 'gallery', 'facts', 'texts', 'reviews', 'socials', 'visit'],
  },
  {
    id: 'services', en: 'Service business', ar: 'نشاط خدمي',
    descEn: 'A list of services with prices and booking buttons. For clinics, salons and workshops.',
    sections: ['actions', 'about', 'services', 'offers', 'buttons', 'gallery', 'facts', 'texts', 'reviews', 'socials', 'visit'],
  },
  {
    id: 'gallery', en: 'Gallery & portfolio', ar: 'معرض أعمال',
    descEn: 'Photos lead the page, with a short bio, services and contact buttons.',
    sections: ['about', 'gallery', 'services', 'actions', 'buttons', 'texts', 'facts', 'reviews', 'socials', 'visit'],
  },
  {
    id: 'contact', en: 'Business contact page', ar: 'صفحة التواصل',
    descEn: 'Contact details first: call, WhatsApp, email, directions, address and hours.',
    sections: ['actions', 'visit', 'about', 'buttons', 'socials', 'facts', 'texts'],
  },
]
export const layoutOf = (id) => LAYOUTS.find((l) => l.id === id) || LAYOUTS[0]

export const ACCENTS = [['blue', 'Blue', '#3a90d4'], ['teal', 'Teal', '#14b8a6'], ['green', 'Green', '#22a06b'], ['purple', 'Purple', '#8b5cf6'], ['rose', 'Rose', '#e2547f'], ['orange', 'Orange', '#f08a1c'], ['dark', 'Charcoal', '#4b5563']]
export const LOGO_SHAPES = [['rounded', 'Rounded square'], ['circle', 'Circle'], ['square', 'Square']]
export const LOGO_SIZES = [['m', 'Medium'], ['l', 'Large'], ['xl', 'Extra large']]
export const BTN_SHAPES = [['rounded', 'Rounded'], ['pill', 'Pill'], ['square', 'Square']]

const has = (v) => typeof v === 'string' && v.trim() !== ''
export const textHasContent = (t) => has(t.title) || has(t.titleAr) || has(t.body) || has(t.bodyAr)

// Does the place have saved content for a section? (independent of visibility toggles and of the layout)
export function sectionHasContent(p, id) {
  if (id.startsWith('text:')) { const t = p.texts.find((x) => x.id === id.slice(5)); return !!t && textHasContent(t) }
  switch (id) {
    case 'about': return has(p.about) || has(p.aboutAr)
    case 'buttons': return p.buttons.some((b) => has(b.label) || has(b.labelAr) || has(b.value))
    case 'actions': return has(p.whatsapp) || p.phones.some((x) => has(x.number)) || p.emails.some((x) => has(x.email)) || has(p.address) || isUrl(p.mapLink)
    case 'socials': return p.socials.some((s) => isUrl(s.url))
    case 'offers': return p.offers.some((o) => has(o.t) || has(o.d) || has(o.tAr) || has(o.dAr))
    case 'menu': return p.menu.some((m) => has(m.n) || has(m.nAr)) || p.menuFiles.length > 0
    case 'products': return p.products.some((x) => has(x.name) || has(x.nameAr))
    case 'services': return p.services.some((x) => has(x.name) || has(x.nameAr))
    case 'gallery': return p.gallery.some((g) => has(g.url))
    case 'facts': return p.facts.some((f) => (has(f.label) || has(f.labelAr)) && (has(f.value) || has(f.valueAr)))
    case 'texts': return p.texts.some(textHasContent)
    case 'reviews': return p.reviews.some((r) => has(r.text) || has(r.name)) || isUrl(p.reviewLink)
    case 'visit': return has(p.address) || has(p.addressAr) || has(p.hours) || has(p.hoursAr)
    default: return false
  }
}
export const sectionIsShown = (p, id) => (id.startsWith('text:') ? (p.texts.find((x) => x.id === id.slice(5)) || {}).show !== false : p.show[id] !== false)

// The ordered section ids for the place's current layout. "texts" expands into one id per custom text.
const expand = (p, ids) => ids.flatMap((id) => (id === 'texts' ? p.texts.map((t) => 'text:' + t.id) : [id]))
export function sectionOrder(p) {
  const lay = layoutOf(p.layout)
  const base = expand(p, lay.sections)
  const saved = (p.orders && p.orders[lay.id]) || []
  const keep = saved.filter((id, i) => base.includes(id) && saved.indexOf(id) === i)
  return [...keep, ...base.filter((id) => !keep.includes(id))]
}
// Sections that have saved content but that the current layout does not display
export const unusedSections = (p) => {
  const lay = layoutOf(p.layout)
  return SECTIONS.filter((s) => !lay.sections.includes(s.id) && sectionHasContent(p, s.id))
}
