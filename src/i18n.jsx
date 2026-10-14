import { createContext, useContext, useState } from 'react'

const U = {
  en: { h1: 'Tap once. Everything opens.', lead: 'Hold your phone on the Tap In card to open the menu, social media, reviews and offers. No app to install.', see: 'See places we support', ph: 'Places we support', ps: 'Tap a card to see what each place offers.', ch: 'Want a Tap In card for your place?', wa: 'Talk to us on WhatsApp', lang: 'العربية', open: 'Open page', offers: 'Offers', menu: 'Menu', visit: 'Visit us', hours: 'Hours', call: 'Call', whats: 'WhatsApp', ig: 'Instagram', fb: 'Facebook', tt: 'TikTok', map: 'Directions', rev: 'Leave a review', nf: 'This place was not found.', dash: 'Dashboard', theme: 'Switch light or dark mode', revT: 'Reviews', viewMenu: 'View menu', viewPdf: 'View menu (PDF)', prev: 'Previous places', next: 'Next places' },
  ar: { h1: 'لمسة واحدة. كل شيء يفتح.', lead: 'قرّب هاتفك من بطاقة Tap In لفتح المنيو والسوشيال ميديا والتقييمات والعروض. بدون تحميل أي تطبيق.', see: 'شاهد الأماكن المدعومة', ph: 'الأماكن التي ندعمها', ps: 'اضغط على البطاقة لمعرفة ما يقدمه كل مكان.', ch: 'تريد بطاقة Tap In لمكانك؟', wa: 'تحدث معنا على واتساب', lang: 'English', open: 'افتح الصفحة', offers: 'العروض', menu: 'المنيو', visit: 'زورونا', hours: 'المواعيد', call: 'اتصل', whats: 'واتساب', ig: 'إنستجرام', fb: 'فيسبوك', tt: 'تيك توك', map: 'الاتجاهات', rev: 'اترك تقييمًا', nf: 'لم يتم العثور على هذا المكان.', dash: 'لوحة التحكم', theme: 'تبديل الوضع الفاتح أو الداكن', revT: 'التقييمات', viewMenu: 'عرض المنيو', viewPdf: 'عرض المنيو (PDF)', prev: 'الأماكن السابقة', next: 'الأماكن التالية' },
}

const Ctx = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('lang') || 'en' } catch { return 'en' }
  })
  const toggle = () => {
    const next = lang === 'en' ? 'ar' : 'en'
    setLang(next)
    try { localStorage.setItem('lang', next) } catch {}
  }
  const t = (k) => U[lang][k]
  // pick the Arabic version of a field (name -> nameAr) when it exists
  const L = (p, k) => (lang === 'ar' && p[k + 'Ar'] ? p[k + 'Ar'] : p[k] || '')
  return <Ctx.Provider value={{ lang, toggle, t, L }}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
