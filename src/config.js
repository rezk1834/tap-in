// Single source of truth for page content and design. Later this moves to a database
// (same shape), so the renderer does not change.
export const SITE = "https://tapineg.site";

// ---- Font library (Arabic + Latin safe, with fallbacks) ----
export const fonts = {
  plex: { label: "IBM Plex Sans Arabic", css: '"IBM Plex Sans Arabic","Sora",sans-serif' },
  cairo: { label: "Cairo", css: '"Cairo","Sora",sans-serif' },
  tajawal: { label: "Tajawal", css: '"Tajawal","Sora",sans-serif' },
  sora: { label: "Sora (+ Arabic fallback)", css: '"Sora","IBM Plex Sans Arabic",sans-serif' },
};

// ---- Global design defaults. A page's `theme` overrides only the keys it sets. ----
export const defaults = {
  font: "plex", headingFont: "plex", accent: "#2B3B97", accent2: "#219DD8",
  bg: "#ffffff", text: "#0F1A3D", radius: 14, buttons: "gradient", // gradient | solid | outline
  iconShape: "circle", // circle | rounded | square
  iconSize: 112, align: "center",
};

// ---- Icon library (stroke paths, 24x24) ----
export const icons = {
  utensils: "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-2 6 0 8v10",
  cup: "M5 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 4h-2",
  store: "M3 9l2-5h14l2 5M4 9v11h16V9M9 20v-6h6v6",
  cart: "M3 4h3l2 11h10l2-8H7M10 20h.01M17 20h.01",
  shirt: "M8 3L3 7l3 3 2-1v12h8V9l2 1 3-3-5-4a4 4 0 0 1-8 0z",
  chip: "M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4",
  pill: "M10.5 20.5a4.95 4.95 0 0 1-7-7l10-10a4.95 4.95 0 0 1 7 7zM8.5 8.5l7 7",
  cross: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6z",
  briefcase: "M3 8h18v12H3zM9 8V5h6v3M3 13h18",
  bed: "M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-8v6",
  sparkle: "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z",
  dumbbell: "M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12",
  pin: "M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11zM12 12h.01",
};

// ---- Categories: add a new one here, nothing else changes ----
export const categories = {
  restaurant: { en: "Restaurant", ar: "مطعم", icon: "utensils", actions: ["menu", "reserve", "call", "directions", "whatsapp"] },
  cafe: { en: "Café", ar: "كافيه", icon: "cup", actions: ["menu", "call", "directions", "whatsapp"] },
  retail: { en: "Retail shop", ar: "متجر", icon: "store", actions: ["products", "offers", "call", "website", "directions"] },
  supermarket: { en: "Supermarket", ar: "سوبر ماركت", icon: "cart", actions: ["products", "offers", "call", "directions"] },
  fashion: { en: "Clothing & fashion", ar: "ملابس وأزياء", icon: "shirt", actions: ["products", "offers", "instagram", "whatsapp"] },
  electronics: { en: "Electronics", ar: "إلكترونيات", icon: "chip", actions: ["products", "offers", "call", "website"] },
  pharmacy: { en: "Pharmacy", ar: "صيدلية", icon: "pill", actions: ["call", "whatsapp", "directions"] },
  clinic: { en: "Clinic", ar: "عيادة", icon: "cross", actions: ["book", "call", "directions", "website"] },
  office: { en: "Office / services", ar: "مكتب وخدمات", icon: "briefcase", actions: ["call", "email", "book", "website", "directions"] },
  hotel: { en: "Hotel", ar: "فندق", icon: "bed", actions: ["rooms", "reserve", "call", "directions"] },
  beauty: { en: "Beauty & personal care", ar: "تجميل وعناية", icon: "sparkle", actions: ["book", "call", "instagram", "directions"] },
  gym: { en: "Gym & fitness", ar: "نادي رياضي", icon: "dumbbell", actions: ["book", "call", "instagram", "directions"] },
  other: { en: "Other", ar: "أخرى", icon: "pin", actions: ["call", "whatsapp", "website", "directions"] },
};

// ---- Link kinds. `field` says how `value` becomes a link. ----
export const kinds = {
  menu: { en: "View menu", ar: "المنيو" }, offers: { en: "Special offers", ar: "العروض الخاصة" },
  products: { en: "Browse products", ar: "تصفح المنتجات" }, rooms: { en: "View rooms", ar: "الغرف والخدمات" },
  reserve: { en: "Reserve", ar: "احجز الآن" }, book: { en: "Book an appointment", ar: "احجز موعدًا" },
  call: { en: "Call", ar: "اتصل بنا", field: "tel" }, email: { en: "Email", ar: "راسلنا", field: "mail" },
  whatsapp: { en: "WhatsApp", ar: "واتساب", field: "wa" }, directions: { en: "Get directions", ar: "الاتجاهات" },
  website: { en: "Website", ar: "الموقع" }, instagram: { en: "Instagram", ar: "إنستجرام" },
  facebook: { en: "Facebook", ar: "فيسبوك" }, tiktok: { en: "TikTok", ar: "تيك توك" },
  youtube: { en: "YouTube", ar: "يوتيوب" }, linkedin: { en: "LinkedIn", ar: "لينكدإن" },
  reviews: { en: "Reviews", ar: "التقييمات" }, google: { en: "Leave a Google review", ar: "قيّمنا على جوجل" },
  custom: { en: "Link", ar: "رابط" },
};

const digits = (v) => String(v || "").replace(/[^\d]/g, "");
export function linkHref(l) {
  const f = kinds[l.kind]?.field, v = String(l.value || "").trim();
  if (!v) return null;
  if (f === "tel") return digits(v).length >= 7 && digits(v).length <= 15 ? `tel:+${digits(v)}` : null;
  if (f === "wa") return digits(v).length >= 7 && digits(v).length <= 15 ? `https://wa.me/${digits(v)}` : null;
  if (f === "mail") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? `mailto:${v}` : null;
  try { const u = new URL(v); return ["http:", "https:"].includes(u.protocol) ? u.href : null; } catch { return null; }
}
export const linkLabel = (l, lang) => l.label?.[lang] || kinds[l.kind]?.[lang] || kinds.custom[lang];

// ---- Slug redirects: { oldSlug: newSlug }. Followed up to 5 hops (loop-safe). ----
export const redirects = {};
export function resolveSlug(s) {
  let cur = s, n = 0;
  while (redirects[cur] && n++ < 5) cur = redirects[cur];
  return cur;
}

// ---- Pages. Every link/section has `visible`; hiding never deletes saved content. ----
// Replace the `value`s with real data; links with an empty/invalid value are not shown.
export const customers = [
  {
    slug: "demo-restaurant", category: "restaurant", icon: null, logo: null,
    name: { ar: "مطعم تجريبي", en: "Demo Restaurant" },
    tagline: { ar: "أكل طازج، لمشاركة اللحظة.", en: "Fresh food, made to share." },
    description: { ar: "", en: "" }, hours: { ar: "", en: "" },
    theme: {}, // e.g. { font: "cairo", accent: "#0F1A3D", buttons: "outline" }
    sections: [{ id: "about", visible: true }, { id: "links", visible: true }, { id: "hours", visible: true }],
    links: [
      { kind: "menu", value: "", visible: true }, { kind: "offers", value: "", visible: true },
      { kind: "call", value: "", visible: true }, { kind: "whatsapp", value: "201515215977", visible: true },
      { kind: "instagram", value: "", visible: true }, { kind: "google", value: "", visible: true },
    ],
  },
  {
    slug: "demo-clinic", category: "clinic", icon: null, logo: null,
    name: { ar: "عيادة تجريبية", en: "Demo Clinic" },
    tagline: { ar: "رعاية تبدأ بلمسة.", en: "Care that starts with a tap." },
    description: { ar: "", en: "" }, hours: { ar: "", en: "" },
    theme: { font: "cairo", iconShape: "rounded", buttons: "solid" },
    sections: [{ id: "about", visible: true }, { id: "links", visible: true }, { id: "hours", visible: true }],
    links: [{ kind: "book", value: "", visible: true }, { kind: "call", value: "", visible: true }, { kind: "directions", value: "", visible: true }],
  },
];
