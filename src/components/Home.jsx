import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { useData } from '../store.jsx'
import { ripple } from '../ripple.js'
import { PlaceIcon, Instagram } from '../icons.jsx'
import { activeSiteLinks } from '../platforms.jsx'

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

  // Show the arrow buttons only when the row is wider than the screen
  useEffect(() => {
    const el = rail.current
    if (!el) return
    const check = () => setMore(el.scrollWidth > el.clientWidth + 4)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [data.places.length])

  const scroll = (dir) => {
    const el = rail.current
    const rtl = document.documentElement.dir === 'rtl' ? -1 : 1
    el.scrollBy({ left: dir * rtl * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  const open = (e, id) => {
    e.preventDefault()
    ripple(e)
    setTimeout(() => nav('/place/' + id), 260)
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
          <div className="rail" ref={rail} tabIndex={0} role="region" aria-label={t('ph')}>
            {data.places.length === 0 && <p className="sub">{status === 'loading' ? t('loading') : ''}</p>}
            {data.places.map((p) => (
              <a key={p.id} className="pc" href={'/place/' + p.id} onClick={(e) => open(e, p.id)}>
                <span className="av">
                  {p.logo ? <img src={p.logo} alt="" /> : <PlaceIcon category={p.category} />}
                </span>
                <span className="k">{L(p, 'type')}</span>
                <strong>{L(p, 'name')}</strong>
                <span className="t">{L(p, 'tagline')}</span>
                <span className="go">{t('open')} {lang === 'ar' ? '←' : '→'}</span>
              </a>
            ))}
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
