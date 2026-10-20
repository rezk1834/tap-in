const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
const mk = (children) => (props) => <svg {...base} {...props}>{children}</svg>

export const Instagram = mk(<><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".6" fill="currentColor" /></>)
export const Facebook = mk(<path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.4l.6-3.5H14V8.8c0-.2.2-.3.4-.3z" fill="currentColor" stroke="none" />)
export const TikTok = mk(<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="currentColor" stroke="none" />)
export const XIcon = mk(<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" fill="currentColor" stroke="none" />)
export const YouTube = mk(<><rect x="3" y="6" width="18" height="12" rx="4" /><path d="M10.5 9.5v5l4-2.5z" fill="currentColor" /></>)
export const LinkedIn = mk(<><rect x="4" y="9" width="3" height="11" fill="currentColor" stroke="none" /><circle cx="5.5" cy="5.5" r="1.8" fill="currentColor" stroke="none" /><path d="M10 9h3v1.6c.6-1 1.7-1.8 3.2-1.8 2.7 0 3.8 1.7 3.8 4.4V20h-3v-6c0-1.5-.5-2.4-1.8-2.4-1.4 0-2.2 1-2.2 2.5V20h-3z" fill="currentColor" stroke="none" /></>)
export const Telegram = mk(<path d="M21 4L3 11l6 2 2 6 3-4 5 3z" />)
export const Globe = mk(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>)
export const LinkIcon = mk(<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />)
export const WhatsApp = mk(<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.52.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.3 1.263.489 1.694.626.712.226 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor" stroke="none" />)
export const FileIcon = mk(<><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 13h6M9 17h6" /></>)
export const Sun = mk(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>)
export const Moon = mk(<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />)

export const Phone = mk(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />)
export const Mail = mk(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>)
export const MapPin = mk(<><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>)
export const Calendar = mk(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>)
export const Cart = mk(<><path d="M3 4h2l2.5 11h10L20 7H6" /><circle cx="9" cy="19.5" r="1.3" /><circle cx="17" cy="19.5" r="1.3" /></>)
export const Download = mk(<path d="M12 4v11M7 11l5 5 5-5M5 20h14" />)
export const Star = mk(<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />)
export const MenuIcon = mk(<path d="M5 7h14M5 12h14M5 17h14" />)
export const Gift = mk(<><rect x="3" y="8" width="18" height="4" /><path d="M12 8v13M5 12v9h14v-9M12 8c-2 0-4-1-4-3s3-2 4 1c1-3 4-3 4-1s-2 3-4 3" /></>)
export const Tag = mk(<><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1" /></>)
export const Clock = mk(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)
export const User = mk(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>)
export const Heart = mk(<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z" />)
export const ImageIcon = mk(<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-8 8" /></>)

const ICONS = { link: LinkIcon, phone: Phone, whatsapp: WhatsApp, mail: Mail, map: MapPin, calendar: Calendar, cart: Cart, download: Download, star: Star, menu: MenuIcon, gift: Gift, tag: Tag, clock: Clock, user: User, heart: Heart, globe: Globe }
// Icon for a custom button. 'none' shows no icon.
export function ButtonIcon({ name, ...props }) {
  const I = ICONS[name]
  return I ? <I {...props} /> : null
}

const CAT = {
  restaurant: mk(<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1.5-3 4-3 7h3v11" />),
  cafe: mk(<path d="M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 9h2a2.5 2.5 0 0 1 0 5h-2M8 3v2M12 3v2" />),
  retail: mk(<path d="M6 8h12l1 12H5L6 8zM9 8V6a3 3 0 0 1 6 0v2" />),
  supermarket: Cart,
  fashion: mk(<path d="M9 4a3 3 0 0 0 6 0l5 3-2 4-2-1v10H8V10l-2 1-2-4z" />),
  electronics: mk(<><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 19h20" /></>),
  pharmacy: mk(<path d="M10.5 20.5a4.95 4.95 0 0 1-7-7l10-10a4.95 4.95 0 0 1 7 7zM8.5 8.5l7 7" />),
  clinic: mk(<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" />),
  beauty: mk(<><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="M8 7.5L20 18M8 16.5L20 6" /></>),
  services: mk(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" /></>),
  other: mk(<path d="M4 9l1-5h14l1 5M4 9v11h16V9M4 9a3 3 0 0 0 5.3 1.9A3 3 0 0 0 14.7 11 3 3 0 0 0 20 9M10 20v-5h4v5" />),
}

// Default icon for a place when it has no uploaded logo
export function PlaceIcon({ category, ...props }) {
  const I = CAT[category] || CAT.other
  return <I {...props} />
}
