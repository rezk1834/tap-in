import { Link } from 'react-router-dom'
import { useLang } from '../i18n.jsx'

export default function Header({ back }) {
  const { t, toggle } = useLang()
  return (
    <header>
      <div className="wrap">
        {back && <Link className="back" to="/" aria-label="Back">‹</Link>}
        <Link to="/" aria-label="Tap In" className="brand">
          <img className="logo" src="/logo.svg" alt="Tap In" />
        </Link>
        <button className="pill" type="button" onClick={toggle}>{t('lang')}</button>
      </div>
    </header>
  )
}
