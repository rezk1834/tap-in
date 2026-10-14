import { Link } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { useTheme } from '../theme.jsx'
import { Sun, Moon } from '../icons.jsx'

export default function Header({ back }) {
  const { t, toggle } = useLang()
  const { theme, toggle: toggleTheme } = useTheme()
  return (
    <header>
      <div className="wrap">
        {back && <Link className="back" to="/" aria-label="Back">‹</Link>}
        <Link to="/" aria-label="Tap In" className="brand">
          <img className="logo" src="/logo.svg" alt="Tap In" />
        </Link>
        <button className="ib" type="button" onClick={toggleTheme} aria-label={t('theme')} title={t('theme')}>
          {theme === 'dark' ? <Sun /> : <Moon />}
        </button>
        <button className="pill" type="button" onClick={toggle}>{t('lang')}</button>
      </div>
    </header>
  )
}
