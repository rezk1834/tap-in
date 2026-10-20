import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { useData } from '../store.jsx'
import { ripple } from '../ripple.js'
import { PlaceIcon, Instagram } from '../icons.jsx'
import { activeSiteLinks } from '../platforms.jsx'
import { CATEGORIES, catLabel } from '../categories.js'

function TapDemo() {
  const { t } = useLang()
  return (
    <div className="stage" aria-hidden="true">
      <div className="rings"><span className="ring" /><span className="ring" /><span className="ring" /></div>
      <div className="nfc"><b>Tap In</b><small>NFC</small></div>
      <div className="phone">
        <div className="screen">
          <div className="sl"><img src="/logo.svg" alt="" /></div>
          <div className="r">{t('menu')}</div>
          <div className="r">{t('revT')}</div>
          <div className="r">{t('offers')}</div>
          <i style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { t, L, lang } = useLang()
  const { data, status } = useData()
  const nav = useNavigate()
  const rail = useRef(null)
  const ig = activeSiteLinks(data.site).find((l) => l.id === 'instagram')
  const [more, setMore] = useState(false)
  const [cat, setCat] = useState('all')

  // only offer filters for the kinds of place that exist
  const used = CATEGORIES.filter((c) => data.places.some((p) => p.category === c.id))
  const active = used.some((c) => c.id === cat) ? cat : 'all'
  const places = active === 'all' ? data.places : data.places.filter((p) => p.category === active)

  // Show the arrow buttons only when the row is wider than the screen
  useEffect(() => {
    const el = rail.current
    if (!el) return
    const check = () => setMore(el.scrollWidth > el.clientWidth + 4)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [places.length])

  const scroll = (dir) => {
    const el = rail.current
    const rtl = document.documentElement.dir === 'rtl' ? -1 : 1
    el.scrollBy({ left: dir * rtl * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  const open = (e, id) => {
    e.preventDefault()
    ripple(e)
    setTimeout(() => nav('/place/' + encodeURIComponent(id)), 260)
  }

  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div>
            <h1>{t('h1')}</h1>
            <p className="lead">{t('lead')}</p>
            <button className="btn" type="button" onClick={() => document.getElementById('places').scrollIntoView({ behavior: 'smooth' })}>
              {t('see')}
            </button>
          </div>
          <TapDemo />
        </div>
      </section>

      <section className="places" id="places">
        <div className="wrap">
          <div className="rhead">
            <div>
              <h2>{t('ph')}</h2>
              <p className="sub">{t('ps')}</p>
            </div>
            <div className="rnav" hidden={!more}>
              <button className="ib" type="button" aria-label={t('prev')} onClick={() => scroll(-1)}>‹</button>
              <button className="ib" type="button" aria-label={t('next')} onClick={() => scroll(1)}>›</button>
            </div>
          </div>
          {used.length > 1 && (
            <div className="cfil" role="group" aria-label={t('filter')}>
              <button type="button" aria-pressed={active === 'all'} onClick={() => setCat('all')}>{t('all')}</button>
              {used.map((c) => (
                <button type="button" key={c.id} aria-pressed={active === c.id} onClick={() => setCat(c.id)}>{lang === 'ar' ? c.ar : c.en}</button>
              ))}
            </div>
          )}
          <div className="rail" ref={rail} tabIndex={0} role="region" aria-label={t('ph')}>
            {places.length === 0 && <p className="sub">{status === 'loading' ? t('loading') : t('noPlaces')}</p>}
            {places.map((p) => {
              const sh = (k) => p.show[k] !== false
              const kind = sh('type') ? L(p, 'type') || catLabel(p.category, lang) : ''
              const nm = sh('name') ? L(p, 'name') : ''
              const tl = sh('tagline') ? L(p, 'tagline') : ''
              return (
                <a key={p.id} className="pc" href={'/place/' + encodeURIComponent(p.id)} onClick={(e) => open(e, p.id)}>
                  <span className="av">
                    {sh('logo') && p.logo ? <img src={p.logo} alt="" /> : <PlaceIcon category={p.category} />}
                  </span>
                  {kind && <span className="k">{kind}</span>}
                  <strong>{nm || kind}</strong>
                  {tl && <span className="t">{tl}</span>}
                  <span className="go">{t('open')} {lang === 'ar' ? '←' : '→'}</span>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="wrap">
          <h2>{t('ch')}</h2>
          <div className="ctas">
            <a className="wa" href={'https://wa.me/' + String(data.site.whatsapp).replace(/\D/g, '')} target="_blank" rel="noopener noreferrer">
              {t('wa')}
            </a>
            {ig && (
              <a className="igb" href={ig.url} target="_blank" rel="noopener noreferrer">
                <Instagram /> {t('igc')}
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
