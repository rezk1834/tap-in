import { isUrl } from './files.js'
import { WhatsApp, Instagram, Facebook, TikTok, XIcon, YouTube, LinkedIn, Telegram, Globe, LinkIcon } from './icons.jsx'

// To support another platform, add one line here. "other" lets the dashboard user type any name.
export const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', Icon: Instagram },
  { id: 'facebook', label: 'Facebook', Icon: Facebook },
  { id: 'tiktok', label: 'TikTok', Icon: TikTok },
  { id: 'x', label: 'X (Twitter)', Icon: XIcon },
  { id: 'youtube', label: 'YouTube', Icon: YouTube },
  { id: 'linkedin', label: 'LinkedIn', Icon: LinkedIn },
  { id: 'telegram', label: 'Telegram', Icon: Telegram },
  { id: 'website', label: 'Website', Icon: Globe },
  { id: 'other', label: 'Other', Icon: LinkIcon },
]

export function platformOf(s) {
  const p = PLATFORMS.find((x) => x.id === s.platform) || PLATFORMS[PLATFORMS.length - 1]
  return { Icon: p.Icon, label: s.platform === 'other' && s.label ? s.label : p.label }
}

// Site-wide accounts: WhatsApp (from the main number) plus four official social accounts
export const SITE_PLATFORMS = [
  { id: 'whatsapp', label: 'WhatsApp', Icon: WhatsApp },
  ...PLATFORMS.filter((x) => ['x', 'facebook', 'instagram', 'tiktok'].includes(x.id)),
]

// Enabled, valid site-wide links (footer + contact button). Disabled ones never reach the public site.
export function activeSiteLinks(site) {
  const wa = String(site.whatsapp || '').replace(/\D/g, '')
  return (site.socials || []).filter((s) => s.enabled).map((s) => {
    const P = SITE_PLATFORMS.find((x) => x.id === s.platform)
    if (!P) return null
    const url = s.platform === 'whatsapp' ? (wa.length >= 8 ? 'https://wa.me/' + wa : '') : isUrl(s.url) ? s.url.trim() : ''
    return url ? { id: s.platform, Icon: P.Icon, label: P.label, url } : null
  }).filter(Boolean)
}
