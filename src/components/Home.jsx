import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { useData } from '../store.jsx'
import { ripple } from '../ripple.js'

function TapDemo() {
  const { t } = useLang()
  return (
    <div className="stage" aria-hidden="true">
      <div className="rings"><span className="ring" /><span className="ring" /><span className="ring" /></div>
      <div className="nfc"><b>Tap In</b><small>NFC</small></div>
      <div className="phone">
        <div className="screen">
          <div className="h" />
          <div className="r">{t('menu')}</div>
          <div className="r">{t('rev')}</div>
          <div className="r">{t('offers')}</div>
          <i style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { t, L, lang } = useLang()
  const { data } = useData()
  const nav = useNavigate()

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
          <h2>{t('ph')}</h2>
          <p className="sub">{t('ps')}</p>
          <div className="grid">
            {data.places.map((p) => (
              <a key={p.id} className="pc" href={'/place/' + p.id} onClick={(e) => open(e, p.id)}>
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
          <a className="wa" href={'https://wa.me/' + String(data.site.whatsapp).replace(/\D/g, '')} target="_blank" rel="noopener noreferrer">
            {t('wa')}
          </a>
        </div>
      </section>
    </main>
  )
}
