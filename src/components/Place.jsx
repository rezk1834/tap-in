import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { useData } from '../store.jsx'
import { ripple } from '../ripple.js'

const isUrl = (u) => /^https?:\/\//i.test(u || '')

export default function Place() {
  const { id } = useParams()
  const { t, L } = useLang()
  const { data } = useData()
  const p = data.places.find((x) => x.id === id)

  useEffect(() => {
    document.title = p ? `${L(p, 'name')} · Tap In` : 'Tap In'
  })

  if (!p) return <div className="pg"><p>{t('nf')}</p></div>

  const actions = []
  if (p.whatsapp) actions.push(['p', t('whats'), 'https://wa.me/' + p.whatsapp.replace(/\D/g, '')])
  if (p.phone) actions.push(['', t('call'), 'tel:' + p.phone.replace(/[^\d+]/g, '')])
  if (isUrl(p.instagram)) actions.push(['', t('ig'), p.instagram])
  if (isUrl(p.facebook)) actions.push(['', t('fb'), p.facebook])
  if (isUrl(p.tiktok)) actions.push(['', t('tt'), p.tiktok])
  if (p.address) actions.push(['', t('map'), 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.address)])
  if (isUrl(p.reviews)) actions.push(['', t('rev'), p.reviews])

  return (
    <>
      <section className="ph">
        <div className="badge">
          <i /><i /><i />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M5 11a8 8 0 0 1 8-8M5 17a14 14 0 0 1 14-14" />
            <circle cx="6" cy="18" r="1.6" fill="currentColor" />
          </svg>
        </div>
        <p className="k">{L(p, 'type')}</p>
        <h1>{L(p, 'name')}</h1>
        <p className="tl">{L(p, 'tagline')}</p>
      </section>

      <div className="pg">
        <div className="acts">
          {actions.map(([cls, label, href]) => (
            <a key={label} className={'act ' + cls} href={href} onClick={ripple} target="_blank" rel="noopener noreferrer">{label}</a>
          ))}
        </div>

        {p.offers?.length > 0 && (
          <div className="sec">
            <h2>{t('offers')}</h2>
            {p.offers.map((o, i) => (
              <div className="offer" key={i}><b>{o.t}</b><span>{o.d}</span></div>
            ))}
          </div>
        )}

        {p.menu?.length > 0 && (
          <div className="sec">
            <h2>{t('menu')}</h2>
            {p.menu.map((m, i) => (
              <div className="mi" key={i}><span>{m.n}</span><b>{m.p}</b></div>
            ))}
          </div>
        )}

        {(p.address || p.hours) && (
          <div className="sec">
            <h2>{t('visit')}</h2>
            {p.address && <p className="info">{p.address}</p>}
            {p.hours && <p className="info">{t('hours')}: {p.hours}</p>}
          </div>
        )}
      </div>
    </>
  )
}
