import { createContext, useContext, useState } from 'react'

const U = {
  en: { h1: 'Tap once. Everything opens.', lead: 'Hold your phone on the Tap In card to open the menu, social media, reviews and offers. No app to install.', see: 'See places we support', ph: 'Places we support', ps: 'Tap a card to see what each place offers.', ch: 'Want a Tap In card for your place?', wa: 'Talk to us on WhatsApp', lang: 'العربية', open: 'Open page', offers: 'Offers', menu: 'Menu', visit: 'Visit us', hours: 'Hours', call: 'Call', whats: 'WhatsApp', ig: 'Instagram', fb: 'Facebook', tt: 'TikTok', map: 'Directions', rev: 'Leave a review', nf: 'This place was not found.', dash: 'Dashboard', theme: 'Switch light or dark mode', revT: 'Reviews', viewMenu: 'View menu', viewPdf: 'View menu (PDF)', igc: 'Contact Us on Instagram', social: 'Social media', loading: 'Loading…', prev: 'Previous places', next: 'Next places', about: 'About', gallery: 'Gallery', products: 'Products', services: 'Services', facts: 'Business info', all: 'All', smaller: 'Decrease text size', larger: 'Increase text size', email: 'Email', view: 'View details', close: 'Close', prevImg: 'Previous photo', nextImg: 'Next photo', emptyPage: 'This page is being set up.', emptyPageSub: 'Please check back soon.', noPlaces: 'No places yet.', filter: 'Filter places by type', openLink: 'Open', photo: 'Photo', contactUs: 'Contact us', home: 'Home', textSize: 'Text size' },
  ar: { h1: 'لمسة واحدة. كل شيء يفتح.', lead: 'قرّب هاتفك من بطاقة Tap In لفتح المنيو والسوشيال ميديا والتقييمات والعروض. بدون تحميل أي تطبيق.', see: 'شاهد الأماكن المدعومة', ph: 'الأماكن التي ندعمها', ps: 'اضغط على البطاقة لمعرفة ما يقدمه كل مكان.', ch: 'تريد بطاقة Tap In لمكانك؟', wa: 'تحدث معنا على واتساب', lang: 'English', open: 'افتح الصفحة', offers: 'العروض', menu: 'المنيو', visit: 'زورونا', hours: 'المواعيد', call: 'اتصل', whats: 'واتساب', ig: 'إنستجرام', fb: 'فيسبوك', tt: 'تيك توك', map: 'الاتجاهات', rev: 'اترك تقييمًا', nf: 'لم يتم العثور على هذا المكان.', dash: 'لوحة التحكم', theme: 'تبديل الوضع الفاتح أو الداكن', revT: 'التقييمات', viewMenu: 'عرض المنيو', viewPdf: 'عرض المنيو (PDF)', igc: 'تواصل معنا على إنستجرام', social: 'وسائل التواصل الاجتماعي', loading: 'جارٍ التحميل…', prev: 'الأماكن السابقة', next: 'الأماكن التالية', about: 'نبذة عنا', gallery: 'معرض الصور', products: 'المنتجات', services: 'الخدمات', facts: 'معلومات', all: 'الكل', smaller: 'تصغير حجم الخط', larger: 'تكبير حجم الخط', email: 'راسلنا', view: 'عرض التفاصيل', close: 'إغلاق', prevImg: 'الصورة السابقة', nextImg: 'الصورة التالية', emptyPage: 'هذه الصفحة قيد الإعداد.', emptyPageSub: 'يُرجى المعاودة قريبًا.', noPlaces: 'لا توجد أماكن بعد.', filter: 'تصفية الأماكن حسب النوع', openLink: 'فتح', photo: 'صورة', contactUs: 'تواصل معنا', home: 'الرئيسية', textSize: 'حجم الخط' },
}

const Ctx = createContext(null)

// pick a field's value in a language: name / nameAr. Falls back to the other language when empty.
export const pick = (o, k, lang) => {
  const en = (o && o[k]) || '', ar = (o && o[k + 'Ar']) || ''
  return lang === 'ar' ? ar || en : en || ar
}
const make = (lang) => ({ lang, t: (k) => (U[lang] && U[lang][k]) || U.en[k] || k, L: (o, k) => pick(o, k, lang) })

// Arabic is the default language. A visitor's own choice is remembered.
export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('lang') === 'en' ? 'en' : 'ar' } catch { return 'ar' }
  })
  const toggle = () => {
    const next = lang === 'en' ? 'ar' : 'en'
    setLang(next)
    try { localStorage.setItem('lang', next) } catch {}
  }
  return <Ctx.Provider value={{ ...make(lang), toggle }}>{children}</Ctx.Provider>
}

// Shows a part of the site in a fixed language (used by the dashboard preview)
export function LangScope({ lang, children }) {
  return <Ctx.Provider value={{ ...make(lang), toggle() {} }}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
