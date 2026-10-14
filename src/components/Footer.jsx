import { useData } from '../store.jsx'
import { useLang } from '../i18n.jsx'
import { activeSiteLinks } from '../platforms.jsx'

export default function Footer() {
  const { data } = useData()
  const { t } = useLang()
  const links = activeSiteLinks(data.site)
  return (
    <footer>
      {links.length > 0 && (
        <nav className="fsoc" aria-label={t('social')}>
          {links.map(({ id, Icon, label, url }) => (
            <a key={id} className="fs" href={url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
              <Icon />
            </a>
          ))}
        </nav>
      )}
      <p>© Tap In</p>
    </footer>
  )
}
