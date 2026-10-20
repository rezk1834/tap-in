import { Fragment, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLang } from '../i18n.jsx'
import { ripple } from '../ripple.js'
import { PlaceIcon, FileIcon, ButtonIcon, ImageIcon, WhatsApp, Phone, Mail, MapPin, Clock } from '../icons.jsx'
import { platformOf } from '../platforms.jsx'
import { isUrl, openFile } from '../files.js'
import { catLabel } from '../categories.js'
import { sectionOrder } from '../layouts.js'
import { KIND_ICON, buttonHref, mapsHref, waHref } from '../buttons.js'

const ext = (href) => (/^https?:/i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})
const vis = (list) => list.filter((x) => x.show !== false)

function Stars({ n }) {
  const r = Math.max(0, Math.min(5, Math.round(n)))
  return <span className="stars" role="img" aria-label={`${r} / 5`}>{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>
}

function Lightbox({ items, index, onClose, onNav, t }) {
  useEffect(() => {
    const key = (e) => { if (e.key === 'Escape') onClose(); else if (e.key === 'ArrowRight') onNav(1); else if (e.key === 'ArrowLeft') onNav(-1) }
    window.addEventListener('keydown', key)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = prev }
  })
  const g = items[index]
  return createPortal(
    <div className="lbx" role="dialog" aria-modal="true" aria-label={t('gallery')} onClick={onClose}>
      <button className="ib x" type="button" onClick={onClose} aria-label={t('close')}>×</button>
      {items.length > 1 && <button className="ib nv l" type="button" onClick={(e) => { e.stopPropagation(); onNav(-1) }} aria-label={t('prevImg')}>‹</button>}
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={g.url} alt={g.cap} />
        {g.cap && <figcaption>{g.cap}</figcaption>}
      </figure>
      {items.length > 1 && <button className="ib nv r" type="button" onClick={(e) => { e.stopPropagation(); onNav(1) }} aria-label={t('nextImg')}>›</button>}
    </div>,
    document.body
  )
}

// The public page of a place. Used by the live page and by the dashboard preview.
// Hidden content is never rendered at all (no empty headings, no alt text, no placeholders for it).
export default function PlaceView({ place: p }) {
  const { t, L, lang } = useLang()
  const [box, setBox] = useState(-1)
  const sh = (k) => p.show[k] !== false

  const name = sh('name') ? L(p, 'name') : ''
  const typeText = sh('type') ? L(p, 'type') || catLabel(p.category, lang) : ''
  const tagline = sh('tagline') ? L(p, 'tagline') : ''
  const cover = sh('cover') ? p.cover : ''
  const showLogo = sh('logo')
  const hasHero = !!(cover || showLogo || typeText || name || tagline)
  const gItems = sh('gallery') ? vis(p.gallery).filter((g) => g.url).map((g) => ({ url: g.url, cap: L(g, 'caption') })) : []

  const S = {}

  S.about = () => {
    const x = sh('about') ? L(p, 'about') : ''
    return x ? <div className="sec about">{p.layout !== 'links' && <h2>{t('about')}</h2>}<p>{x}</p></div> : null
  }

  S.buttons = () => {
    if (!sh('buttons')) return null
    const list = vis(p.buttons).map((b) => ({ b, href: buttonHref(b, p), label: L(b, 'label') })).filter((x) => x.href && x.label)
    if (!list.length) return null
    return (
      <div className="sec cbs">
        {list.map(({ b, href, label }, i) => (
          <a key={b.id || i} className={'cbtn' + (b.style === 'outline' ? ' out' : '')} href={href} onClick={ripple} {...ext(href)}>
            <ButtonIcon name={b.icon === 'auto' ? KIND_ICON[b.kind] : b.icon} />{label}
          </a>
        ))}
      </div>
    )
  }

  S.actions = () => {
    if (!sh('actions')) return null
    const a = []
    const wa = waHref(p.whatsapp)
    if (sh('whatsapp') && wa) a.push({ k: 'wa', cls: 'p', icon: <WhatsApp />, label: t('whats'), href: wa })
    vis(p.phones).filter((x) => x.number.replace(/\D/g, '').length >= 3).forEach((x, i) =>
      a.push({ k: 'ph' + i, icon: <Phone />, label: <>{t('call')} <bdi>{L(x, 'label') || x.number}</bdi></>, href: 'tel:' + x.number.replace(/[^\d+]/g, '') }))
    vis(p.emails).filter((x) => x.email.trim()).forEach((x, i) =>
      a.push({ k: 'em' + i, icon: <Mail />, label: <>{t('email')} <bdi>{L(x, 'label') || x.email}</bdi></>, href: 'mailto:' + x.email.trim() }))
    const map = sh('directions') ? mapsHref(p) : ''
    if (map) a.push({ k: 'map', icon: <MapPin />, label: t('map'), href: map })
    if (!a.length) return null
    return (
      <div className="sec acts">
        {a.map((x) => <a key={x.k} className={'act ' + (x.cls || '')} href={x.href} onClick={ripple} {...ext(x.href)}>{x.icon}{x.label}</a>)}
      </div>
    )
  }

  S.socials = () => {
    if (!sh('socials')) return null
    const list = vis(p.socials).filter((s) => isUrl(s.url))
    if (!list.length) return null
    return (
      <div className="sec soc">
        {list.map((s, i) => {
          const { Icon, label } = platformOf(s)
          return <a key={i} className="sb" href={s.url.trim()} onClick={ripple} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}><Icon /></a>
        })}
      </div>
    )
  }

  S.offers = () => {
    if (!sh('offers')) return null
    const list = vis(p.offers).filter((o) => L(o, 't') || L(o, 'd'))
    if (!list.length) return null
    return (
      <div className="sec">
        <h2>{t('offers')}</h2>
        {list.map((o, i) => <div className="offer" key={i}><b>{L(o, 't')}</b><span>{L(o, 'd')}</span></div>)}
      </div>
    )
  }

  S.menu = () => {
    if (!sh('menu')) return null
    const list = vis(p.menu).filter((m) => L(m, 'n'))
    const files = vis(p.menuFiles)
    const images = files.filter((f) => f.type.startsWith('image/'))
    const pdfs = files.filter((f) => f.type === 'application/pdf')
    if (!list.length && !images.length && !pdfs.length) return null
    let last = null
    return (
      <div className="sec">
        <h2>{t('menu')}</h2>
        {list.map((m, i) => {
          const g = L(m, 'g')
          let head = ''
          if (g) { head = g !== last ? g : ''; last = g }
          return (
            <Fragment key={i}>
              {head && <h3 className="mg">{head}</h3>}
              <div className="mi">
                <span className="mn">{L(m, 'n')}{L(m, 'd') && <small>{L(m, 'd')}</small>}</span>
                {m.p && <b>{m.p}</b>}
              </div>
            </Fragment>
          )
        })}
        {images.length > 0 && (
          <div className="menugal">
            {images.map((f, i) => (
              <button className="menuimg" type="button" key={i} onClick={() => openFile(f)} aria-label={`${t('viewMenu')} ${i + 1}`}>
                <img src={f.data || f.url} alt={`${t('menu')} ${i + 1}`} loading="lazy" />
              </button>
            ))}
          </div>
        )}
        {pdfs.map((f, i) => (
          <button className="btn" type="button" key={i} onClick={() => openFile(f)}>
            <FileIcon width="20" height="20" /> {t('viewPdf')}{pdfs.length > 1 ? ' ' + (i + 1) : ''}
          </button>
        ))}
      </div>
    )
  }

  // products and services share one card shape: photo, name, description, price, optional link
  const listing = (key, title, cls) => () => {
    if (!sh(key)) return null
    const list = vis(p[key]).filter((x) => L(x, 'name'))
    if (!list.length) return null
    return (
      <div className="sec">
        <h2>{title}</h2>
        <div className={cls}>
          {list.map((x) => (
            <div className="card2" key={x.id}>
              {x.img
                ? <img className="cimg" src={x.img} alt={L(x, 'name')} loading="lazy" />
                : key === 'products' ? <div className="cimg none"><ImageIcon /></div> : null}
              <div className="cbody">
                <b>{L(x, 'name')}</b>
                {L(x, 'desc') && <span className="cd">{L(x, 'desc')}</span>}
                {x.price && <span className="cprice">{x.price}</span>}
                {isUrl(x.link) && <a className="more" href={x.link.trim()} onClick={ripple} target="_blank" rel="noopener noreferrer">{t('view')}</a>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  S.products = listing('products', t('products'), 'pgrid')
  S.services = listing('services', t('services'), 'slist')

  S.gallery = () => {
    if (!gItems.length) return null
    return (
      <div className="sec">
        <h2>{t('gallery')}</h2>
        <div className="ggrid">
          {gItems.map((g, i) => (
            <button className="gitem" type="button" key={i} onClick={() => setBox(i)} aria-label={g.cap || `${t('photo')} ${i + 1}`}>
              <img src={g.url} alt={g.cap} loading="lazy" />
              {g.cap && <span className="gcap">{g.cap}</span>}
            </button>
          ))}
        </div>
      </div>
    )
  }

  S.facts = () => {
    if (!sh('facts')) return null
    const list = vis(p.facts).filter((f) => L(f, 'label') && L(f, 'value'))
    if (!list.length) return null
    return (
      <div className="sec">
        <h2>{t('facts')}</h2>
        <dl className="facts">
          {list.map((f) => <div className="fact" key={f.id}><dt>{L(f, 'label')}</dt><dd>{L(f, 'value')}</dd></div>)}
        </dl>
      </div>
    )
  }

  S.reviews = () => {
    if (!sh('reviews')) return null
    const list = vis(p.reviews).filter((r) => r.text || r.name)
    const link = isUrl(p.reviewLink) ? p.reviewLink.trim() : ''
    if (!list.length && !link) return null
    const avg = list.length ? list.reduce((s, r) => s + (+r.rating || 0), 0) / list.length : 0
    return (
      <div className="sec">
        <h2>{t('revT')}</h2>
        {list.length > 0 && <div className="rsum"><Stars n={avg} /><span>{avg.toFixed(1)} ({list.length})</span></div>}
        {list.map((r, i) => (
          <div className="rv" key={i}>
            <div className="rh"><b>{r.name}</b>{+r.rating > 0 && <Stars n={r.rating} />}</div>
            {r.text && <p>{r.text}</p>}
          </div>
        ))}
        {link && <a className="btn" href={link} target="_blank" rel="noopener noreferrer" onClick={ripple}>{t('rev')}</a>}
      </div>
    )
  }

  S.visit = () => {
    if (!sh('visit')) return null
    const addr = sh('address') ? L(p, 'address') : ''
    const hrs = sh('hours') ? L(p, 'hours') : ''
    if (!addr && !hrs) return null
    return (
      <div className="sec visit">
        <h2>{t('visit')}</h2>
        {addr && <p className="info"><MapPin />{addr}</p>}
        {hrs && <p className="info"><Clock />{t('hours')}: {hrs}</p>}
      </div>
    )
  }

  const text = (id) => {
    const x = p.texts.find((y) => y.id === id)
    if (!x || x.show === false) return null
    const title = L(x, 'title'), body = L(x, 'body')
    if (!title && !body) return null
    return <div className="sec txt">{title && <h2>{title}</h2>}{body && <p>{body}</p>}</div>
  }

  const nodes = sectionOrder(p)
    .map((id) => ({ id, node: id.startsWith('text:') ? text(id.slice(5)) : S[id] ? S[id]() : null }))
    .filter((x) => x.node)

  const move = (d) => setBox((i) => (i + d + gItems.length) % gItems.length)

  return (
    <div className="plc">
      <div className={`pvi lay-${p.layout} lsz-${p.logoSize} ac-${p.accent} bs-${p.btnShape}`}>
        {hasHero && (
          <section className={'hero2 ' + (cover ? 'hascov' : 'nocov')}>
            {cover && <img className="cov" src={cover} alt="" />}
            <div className="idn">
              {showLogo && (
                <div className={'lg2 ' + p.logoShape}>
                  <span className="tr" /><span className="tr" /><span className="tr" />
                  <span className="lgi">{p.logo ? <img src={p.logo} alt={name} /> : <PlaceIcon category={p.category} />}</span>
                </div>
              )}
              {typeText && <p className="k">{typeText}</p>}
              {name && <h1>{name}</h1>}
              {tagline && <p className="tl">{tagline}</p>}
            </div>
          </section>
        )}
        <div className="pb">
          {nodes.map(({ id, node }) => <Fragment key={id}>{node}</Fragment>)}
          {nodes.length === 0 && (
            <div className="empty">
              <PlaceIcon category={p.category} />
              <p><b>{t('emptyPage')}</b></p>
              <p>{t('emptyPageSub')}</p>
            </div>
          )}
        </div>
      </div>
      {box >= 0 && gItems[box] && <Lightbox items={gItems} index={box} onClose={() => setBox(-1)} onNav={move} t={t} />}
    </div>
  )
}
