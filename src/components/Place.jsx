import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { useData } from '../store.jsx'
import { ripple } from '../ripple.js'
import { PlaceIcon } from '../icons.jsx'
import { platformOf } from '../platforms.jsx'
import { isUrl, openFile } from '../files.js'

function Stars({ n }) {
  const r = Math.max(0, Math.min(5, Math.round(n)))
  return <span className="stars" role="img" aria-label={`${r} / 5`}>{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>
}

export default function Place() {
  const { id } = useParams()
  const { t, L } = useLang()
  const { data, status } = useData()
  const p = data.places.find((x) => x.id === id)

  useEffect(() => {
    document.title = p ? `${L(p, 'name')} · Tap In` : 'Tap In'
  })

  if (!p) return <div className="pg"><p>{status === 'loading' ? t('loading') : t('nf')}</p></div>

  const show = p.show
  // Links toggle covers social icons and phone numbers. WhatsApp is always shown.
  const socials = show.links ? p.socials.filter((s) => isUrl(s.url)) : []
  const phones = show.links ? p.phones.filter((x) => x.number && x.number.trim()) : []
  const offers = show.offers ? p.offers.filter((o) => o.t || o.d) : []
  const items = p.menu.filter((m) => m.n)
  const hasMenu = show.menu && (items.length > 0 || p.menuFile)
  const reviews = p.reviews.filter((r) => r.text || r.name)
  const hasReviews = show.reviews && (reviews.length > 0 || isUrl(p.reviewLink))
  const avg = reviews.length ? reviews.reduce((s, r) => s + (+r.rating || 0), 0) / reviews.length : 0

  const actions = []
  if (p.whatsapp) actions.push(['p', t('whats'), 'https://wa.me/' + p.whatsapp.replace(/\D/g, '')])
  phones.forEach((x) => actions.push(['', <>{t('call')} <bdi>{x.label || x.number}</bdi></>, 'tel:' + x.number.replace(/[^\d+]/g, '')]))
  if (p.address) actions.push(['', t('map'), 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.address)])

  return (
    <>
      <section className="ph">
        <div className="tcard" aria-hidden="true">
          <span className="tr" /><span className="tr" /><span className="tr" />
          <div className="face">
            <div className="lg">{p.logo ? <img src={p.logo} alt="" /> : <PlaceIcon category={p.category} />}</div>
          </div>
        </div>
        <p className="k">{L(p, 'type')}</p>
        <h1>{L(p, 'name')}</h1>
        <p className="tl">{L(p, 'tagline')}</p>
        {socials.length > 0 && (
          <div className="soc">
            {socials.map((s, i) => {
              const { Icon, label } = platformOf(s)
              return (
                <a key={i} className="sb" href={s.url.trim()} onClick={ripple} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                  <Icon />
                </a>
              )
            })}
          </div>
        )}
      </section>

      <div className="pg">
        {actions.length > 0 && (
          <div className="acts">
            {actions.map(([cls, label, href], i) => (
              <a key={i} className={'act ' + cls} href={href} onClick={ripple} target="_blank" rel="noopener noreferrer">{label}</a>
            ))}
          </div>
        )}

        {offers.length > 0 && (
          <div className="sec">
            <h2>{t('offers')}</h2>
            {offers.map((o, i) => (
              <div className="offer" key={i}><b>{o.t}</b><span>{o.d}</span></div>
            ))}
          </div>
        )}

        {hasMenu && (
          <div className="sec">
            <h2>{t('menu')}</h2>
            {items.map((m, i) => (
              <div className="mi" key={i}><span>{m.n}</span><b>{m.p}</b></div>
            ))}
            {p.menuFile && p.menuFile.type.startsWith('image/') && (
              <button className="menuimg" type="button" onClick={() => openFile(p.menuFile)} aria-label={t('viewMenu')}>
                <img src={p.menuFile.data || p.menuFile.url} alt={t('menu')} />
              </button>
            )}
            {p.menuFile && p.menuFile.type === 'application/pdf' && (
              <button className="btn" type="button" onClick={() => openFile(p.menuFile)}>{t('viewPdf')}</button>
            )}
          </div>
        )}

        {hasReviews && (
          <div className="sec">
            <h2>{t('revT')}</h2>
            {reviews.length > 0 && (
              <div className="rsum"><Stars n={avg} /><span>{avg.toFixed(1)} ({reviews.length})</span></div>
            )}
            {reviews.map((r, i) => (
              <div className="rv" key={i}>
                <div className="rh"><b>{r.name}</b>{+r.rating > 0 && <Stars n={r.rating} />}</div>
                {r.text && <p>{r.text}</p>}
              </div>
            ))}
            {isUrl(p.reviewLink) && (
              <a className="btn" href={p.reviewLink.trim()} target="_blank" rel="noopener noreferrer" onClick={ripple}>{t('rev')}</a>
            )}
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
