import { isUrl } from './files.js'
import { Instagram, Facebook, TikTok, XIcon, YouTube, LinkedIn, Telegram, Globe, LinkIcon } from './icons.jsx'

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

// Enabled, valid site-wide links (footer + contact button). Disabled ones never reach the public site.
export function activeSiteLinks(site) {
  return (site.socials || [])
    .filter((s) => s.enabled && isUrl(s.url))
    .map((s) => ({ ...platformOf(s), id: s.platform, url: s.url.trim() }))
}
