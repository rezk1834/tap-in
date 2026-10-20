// Business / place categories. `layout` is the page layout suggested for that kind of business.
export const CATEGORIES = [
  { id: 'restaurant', en: 'Restaurant', ar: 'مطعم', layout: 'menu' },
  { id: 'cafe', en: 'Café', ar: 'كافيه', layout: 'menu' },
  { id: 'retail', en: 'Retail shop / store', ar: 'متجر', layout: 'catalog' },
  { id: 'supermarket', en: 'Supermarket & grocery', ar: 'سوبر ماركت وبقالة', layout: 'catalog' },
  { id: 'fashion', en: 'Clothing & fashion', ar: 'ملابس وأزياء', layout: 'catalog' },
  { id: 'electronics', en: 'Electronics & technology', ar: 'إلكترونيات وتكنولوجيا', layout: 'catalog' },
  { id: 'pharmacy', en: 'Pharmacy', ar: 'صيدلية', layout: 'profile' },
  { id: 'clinic', en: 'Clinic & healthcare', ar: 'عيادة ورعاية صحية', layout: 'services' },
  { id: 'beauty', en: 'Beauty salon & personal care', ar: 'صالون تجميل وعناية شخصية', layout: 'services' },
  { id: 'services', en: 'Other service provider', ar: 'مقدم خدمات', layout: 'services' },
  { id: 'other', en: 'Other local business', ar: 'نشاط محلي آخر', layout: 'profile' },
]
export const CAT_IDS = CATEGORIES.map((c) => c.id)
export const catOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
export const catLabel = (id, lang) => (lang === 'ar' ? catOf(id).ar : catOf(id).en)
