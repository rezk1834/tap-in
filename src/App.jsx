import { useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useLang } from './i18n.jsx'
import Header from './components/Header.jsx'
import Home from './components/Home.jsx'
import Place from './components/Place.jsx'
import Admin from './components/Admin.jsx'

export default function App() {
  const { lang, t } = useLang()
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    document.documentElement.lang = isAdmin ? 'en' : lang
    document.documentElement.dir = !isAdmin && lang === 'ar' ? 'rtl' : 'ltr'
    window.scrollTo(0, 0)
  }, [lang, isAdmin, pathname])

  return (
    <>
      <Header back={pathname !== '/'} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/place/:id" element={<Place />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Place />} />
      </Routes>
      <footer>
        © Tap In · <Link to="/admin">{t('dash')}</Link>
      </footer>
    </>
  )
}
