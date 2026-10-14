const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
const mk = (children) => (props) => <svg {...base} {...props}>{children}</svg>

export const Instagram = mk(<><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".6" fill="currentColor" /></>)
export const Facebook = mk(<path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.4l.6-3.5H14V8.8c0-.2.2-.3.4-.3z" fill="currentColor" stroke="none" />)
export const TikTok = mk(<path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.3 2.3 1.9 4 4.5 4.2" />)
export const XIcon = mk(<path d="M5 5l14 14M19 5L5 19" />)
export const YouTube = mk(<><rect x="3" y="6" width="18" height="12" rx="4" /><path d="M10.5 9.5v5l4-2.5z" fill="currentColor" /></>)
export const LinkedIn = mk(<><rect x="4" y="9" width="3" height="11" fill="currentColor" stroke="none" /><circle cx="5.5" cy="5.5" r="1.8" fill="currentColor" stroke="none" /><path d="M10 9h3v1.6c.6-1 1.7-1.8 3.2-1.8 2.7 0 3.8 1.7 3.8 4.4V20h-3v-6c0-1.5-.5-2.4-1.8-2.4-1.4 0-2.2 1-2.2 2.5V20h-3z" fill="currentColor" stroke="none" /></>)
export const Telegram = mk(<path d="M21 4L3 11l6 2 2 6 3-4 5 3z" />)
export const Globe = mk(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>)
export const LinkIcon = mk(<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />)
export const Sun = mk(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>)
export const Moon = mk(<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />)

const CAT = {
  restaurant: mk(<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1.5-3 4-3 7h3v11" />),
  cafe: mk(<path d="M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 9h2a2.5 2.5 0 0 1 0 5h-2M8 3v2M12 3v2" />),
  clinic: mk(<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" />),
  other: mk(<path d="M4 9l1-5h14l1 5M4 9v11h16V9M4 9a3 3 0 0 0 5.3 1.9A3 3 0 0 0 14.7 11 3 3 0 0 0 20 9M10 20v-5h4v5" />),
}

// Default icon for a place when it has no uploaded logo
export function PlaceIcon({ category, ...props }) {
  const I = CAT[category] || CAT.other
  return <I {...props} />
}
