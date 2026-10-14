import { useRef, useState } from 'react'
import { useData } from '../store.jsx'
import { PLATFORMS } from '../platforms.jsx'
import { PlaceIcon } from '../icons.jsx'
import { prepareLogo, prepareMenu, kb, isUrl, openFile } from '../files.js'

const PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'tapin-admin'

const TEXT_FIELDS = [
  ['type', 'Type, e.g. Restaurant'], ['typeAr', 'Type (Arabic)'],
  ['name', 'Name'], ['nameAr', 'Name (Arabic)'],
  ['tagline', 'Tagline'], ['taglineAr', 'Tagline (Arabic)'],
  ['whatsapp', 'WhatsApp number (digits with country code)'],
  ['address', 'Address (used for Directions)'], ['hours', 'Opening hours'],
]

const SECTIONS = [
  ['menu', 'Menu', 'Menu items and the uploaded menu'],
  ['offers', 'Offers', 'The offers list'],
  ['links', 'Links', 'Social media icons and phone numbers (WhatsApp always stays)'],
  ['reviews', 'Reviews', 'Customer reviews and the review link'],
]

const CATEGORIES = [['restaurant', 'Restaurant'], ['cafe', 'Café'], ['clinic', 'Clinic'], ['other', 'Other']]

const blank = () => ({
  id: 'place-' + Math.random().toString(36).slice(2, 7),
  category: 'other', logo: '', menuFile: null,
  type: '', typeAr: '', name: 'New place', nameAr: '', tagline: '', taglineAr: '',
  whatsapp: '', address: '', hours: '', reviewLink: '',
  show: { menu: true, offers: true, links: true, reviews: true },
  phones: [], socials: [], offers: [], menu: [], reviews: [],
})

function Field({ label, value, onChange, ...rest }) {
  return (
    <label className="fld">
      <span>{label}</span>
      <input value={value || ''} onChange={(e) => onChange(e.target.value)} {...rest} />
    </label>
  )
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="tg">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="sw" />
      <span className="tgt"><b>{label}</b><small>{hint}</small></span>
    </label>
  )
}

const Note = ({ n }) => (n ? <p className={'note ' + n.kind} role="status">{n.text}</p> : null)

export default function Admin() {
  const { data, update, replace, reset, storageError } = useData()
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('tapin-admin') === '1')
  const [pw, setPw] = useState('')
  const [bad, setBad] = useState(false)
  const [sel, setSel] = useState(0)
  const [confirm, setConfirm] = useState(false)
  const [msg, setMsg] = useState('')
  const [up, setUp] = useState({})
  const fileRef = useRef(null)

  if (!authed) {
    return (
      <div className="pg">
        <h2>Dashboard</h2>
        <form onSubmit={(e) => {
          e.preventDefault()
          if (pw === PASS) { sessionStorage.setItem('tapin-admin', '1'); setAuthed(true) } else setBad(true)
        }}>
          <label className="fld"><span>Password</span>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
          </label>
          {bad && <p className="note err" role="alert">Wrong password.</p>}
          <button className="btn" type="submit">Sign in</button>
        </form>
      </div>
    )
  }

  const p = sel === 'site' ? null : data.places[sel]
  const link = `${location.origin}/place/${p?.id}`
  const choose = (i) => { setSel(i); setConfirm(false); setUp({}) }

  const setField = (k, v) => update((d) => { d.places[sel][k] = v })
  const setItem = (list, j, k, v) => update((d) => { d.places[sel][list][j][k] = v })
  const addItem = (list, item) => update((d) => { d.places[sel][list].push(item) })
  const rmItem = (list, j) => update((d) => { d.places[sel][list].splice(j, 1) })
  const note = (key, kind, text) => setUp((u) => ({ ...u, [key]: { kind, text } }))

  const onLogo = async (e) => {
    const f = e.target.files[0]; e.target.value = ''
    if (!f) return
    note('logo', 'info', 'Processing…')
    const r = await prepareLogo(f)
    if (r.error) return note('logo', 'err', r.error)
    setField('logo', r.data)
    note('logo', 'ok', `Logo uploaded (${kb(r.data.length)}). It now shows on the card and the place page.`)
  }
  const onMenu = async (e) => {
    const f = e.target.files[0]; e.target.value = ''
    if (!f) return
    note('menu', 'info', 'Processing…')
    const r = await prepareMenu(f)
    if (r.error) return note('menu', 'err', r.error)
    setField('menuFile', r.file)
    note('menu', 'ok', `Menu uploaded: ${r.file.name} (${kb(f.size)}).`)
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'places.json'
    a.click()
    setMsg('Downloaded places.json. Put it in src/data/ and commit it to publish.')
  }
  const importJson = (e) => {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    f.text().then((txt) => {
      try {
        const d = JSON.parse(txt)
        if (!Array.isArray(d.places) || !d.site) throw new Error()
        replace(d); setSel(0); setMsg('Imported.')
      } catch { setMsg('That file is not a valid places.json.') }
    })
  }
  const copy = () => {
    navigator.clipboard?.writeText(link).then(() => setMsg('Link copied.'), () => setMsg('Copy failed. Select the link and copy it.'))
  }

  const has = p && {
    menu: p.menu.some((m) => m.n) || !!p.menuFile,
    offers: p.offers.some((o) => o.t || o.d),
    links: p.phones.some((x) => x.number) || p.socials.some((s) => isUrl(s.url)),
    reviews: p.reviews.length > 0 || isUrl(p.reviewLink),
  }

  return (
    <div className="adm">
      <div className="side">
        {data.places.map((x, i) => (
          <button key={x.id} className={'li' + (sel === i ? ' on' : '')} type="button" onClick={() => choose(i)}>
            {x.name || 'Untitled'}
          </button>
        ))}
        <button className={'li' + (sel === 'site' ? ' on' : '')} type="button" onClick={() => choose('site')}>Site settings</button>
        <button className="li add" type="button" onClick={() => { update((d) => { d.places.push(blank()) }); choose(data.places.length) }}>+ Add place</button>
      </div>

      <div>
        {sel === 'site' ? (
          <div className="panel">
            <h2>Site settings</h2>
            <Field label="Main WhatsApp number (digits with country code)" value={data.site.whatsapp} onChange={(v) => update((d) => { d.site.whatsapp = v })} />
          </div>
        ) : p ? (
          <div className="panel">
            <h2>{p.name || 'New place'}</h2>
            <label className="fld"><span>NFC card link (write this to the card)</span>
              <div className="lk"><input readOnly value={link} /><button className="sm" type="button" onClick={copy}>Copy</button></div>
            </label>
            {TEXT_FIELDS.map(([k, label]) => <Field key={k} label={label} value={p[k]} onChange={(v) => setField(k, v)} />)}

            <h3>Logo and icon</h3>
            <label className="fld"><span>Default icon (shown when there is no logo)</span>
              <select value={p.category} onChange={(e) => setField('category', e.target.value)}>
                {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <div className="up">
              <span className="pv">{p.logo ? <img src={p.logo} alt="Current logo" /> : <PlaceIcon category={p.category} />}</span>
              <label className="sm filebtn">{p.logo ? 'Replace logo' : 'Upload logo'}
                <input className="vh" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onLogo} />
              </label>
              {p.logo && <button className="sm d" type="button" onClick={() => { setField('logo', ''); note('logo', 'ok', 'Logo removed. The default icon is shown.') }}>Remove logo</button>}
            </div>
            <p className="hint">PNG, JPG, WebP or SVG. Large images are resized automatically. SVG up to 200 KB.</p>
            <Note n={up.logo} />

            <h3>Sections on the public page</h3>
            {SECTIONS.map(([k, label, hint]) => (
              <Toggle key={k} label={label} hint={hint + (has[k] ? '' : ' (nothing added yet, so nothing shows)')}
                checked={p.show[k] !== false} onChange={(v) => update((d) => { d.places[sel].show[k] = v })} />
            ))}

            <h3>Phone numbers</h3>
            {p.phones.map((x, j) => (
              <div className="row ph2" key={j}>
                <input placeholder="Label, e.g. Reception" aria-label="Label" value={x.label} onChange={(e) => setItem('phones', j, 'label', e.target.value)} />
                <input placeholder="+20 ..." aria-label="Phone number" inputMode="tel" value={x.number} onChange={(e) => setItem('phones', j, 'number', e.target.value)} />
                <button className="sm d" type="button" onClick={() => rmItem('phones', j)}>Remove</button>
              </div>
            ))}
            <button className="sm" type="button" onClick={() => addItem('phones', { label: '', number: '' })}>+ Add phone number</button>

            <h3>Social media</h3>
            {p.socials.map((s, j) => (
              <div className="item" key={j}>
                <div className="row s">
                  <select aria-label="Platform" value={s.platform} onChange={(e) => setItem('socials', j, 'platform', e.target.value)}>
                    {PLATFORMS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                  </select>
                  <input placeholder="https://..." aria-label="Link" inputMode="url" value={s.url} onChange={(e) => setItem('socials', j, 'url', e.target.value)} />
                  <button className="sm d" type="button" onClick={() => rmItem('socials', j)}>Remove</button>
                </div>
                {s.platform === 'other' && (
                  <input placeholder="Name of the platform, e.g. Snapchat" aria-label="Platform name" value={s.label || ''} onChange={(e) => setItem('socials', j, 'label', e.target.value)} />
                )}
                {s.url && !isUrl(s.url) && <p className="note err">Links must start with http:// or https://, so this one is hidden for now.</p>}
              </div>
            ))}
            <button className="sm" type="button" onClick={() => addItem('socials', { platform: 'instagram', url: '' })}>+ Add social link</button>

            <h3>Offers</h3>
            {p.offers.map((o, j) => (
              <div className="row o" key={j}>
                <input placeholder="Title" value={o.t} onChange={(e) => setItem('offers', j, 't', e.target.value)} />
                <input placeholder="Details" value={o.d} onChange={(e) => setItem('offers', j, 'd', e.target.value)} />
                <button className="sm d" type="button" onClick={() => rmItem('offers', j)}>Remove</button>
              </div>
            ))}
            <button className="sm" type="button" onClick={() => addItem('offers', { t: '', d: '' })}>+ Add offer</button>

            <h3>Menu</h3>
            {p.menu.map((m, j) => (
              <div className="row" key={j}>
                <input placeholder="Item" value={m.n} onChange={(e) => setItem('menu', j, 'n', e.target.value)} />
                <input placeholder="Price" value={m.p} onChange={(e) => setItem('menu', j, 'p', e.target.value)} />
                <button className="sm d" type="button" onClick={() => rmItem('menu', j)}>Remove</button>
              </div>
            ))}
            <button className="sm" type="button" onClick={() => addItem('menu', { n: '', p: '' })}>+ Add menu item</button>
            <div className="up" style={{ marginTop: 16 }}>
              <label className="sm filebtn">{p.menuFile ? 'Replace menu file' : 'Upload menu (PDF or image)'}
                <input className="vh" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" onChange={onMenu} />
              </label>
              {p.menuFile && <>
                <button className="sm" type="button" onClick={() => openFile(p.menuFile)}>Preview {p.menuFile.name}</button>
                <button className="sm d" type="button" onClick={() => { setField('menuFile', null); note('menu', 'ok', 'Menu file removed.') }}>Remove file</button>
              </>}
            </div>
            <p className="hint">PDF, PNG, JPG or WebP up to 1.5 MB. Without a file, only the menu items above are shown.</p>
            <Note n={up.menu} />

            <h3>Reviews</h3>
            <Field label="Link for “Leave a review” (e.g. Google reviews)" value={p.reviewLink} inputMode="url" onChange={(v) => setField('reviewLink', v)} />
            {p.reviewLink && !isUrl(p.reviewLink) && <p className="note err">Links must start with http:// or https://</p>}
            {p.reviews.map((r, j) => (
              <div className="rvrow" key={j}>
                <input placeholder="Customer name" aria-label="Customer name" value={r.name} onChange={(e) => setItem('reviews', j, 'name', e.target.value)} />
                <select aria-label="Rating" value={r.rating} onChange={(e) => setItem('reviews', j, 'rating', +e.target.value)}>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
                </select>
                <button className="sm d" type="button" onClick={() => rmItem('reviews', j)}>Remove</button>
                <textarea rows={2} placeholder="What the customer said" aria-label="Review text" value={r.text} onChange={(e) => setItem('reviews', j, 'text', e.target.value)} />
              </div>
            ))}
            <button className="sm" type="button" onClick={() => addItem('reviews', { name: '', rating: 5, text: '' })}>+ Add review</button>

            <h3>Danger zone</h3>
            <button className="sm d" type="button" onClick={() => {
              if (!confirm) return setConfirm(true)
              update((d) => { d.places.splice(sel, 1) }); choose(0)
            }}>{confirm ? 'Click again to delete this place' : 'Delete place'}</button>
          </div>
        ) : null}

        <div className="bar">
          <button className="btn" type="button" onClick={exportJson}>Export places.json</button>
          <button className="sm" type="button" onClick={() => fileRef.current.click()}>Import</button>
          <button className="sm d" type="button" onClick={() => { reset(); choose(0); setMsg('Reset to the data in the repo.') }}>Reset</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importJson} />
          <span className={'msg' + (storageError ? ' err' : '')} role="status">
            {storageError ? 'Browser storage is full, so recent edits are not saved. Export places.json now, or use smaller uploads.' : msg || 'Edits are saved in this browser. Export and commit places.json to publish them.'}
          </span>
        </div>
      </div>
    </div>
  )
}
