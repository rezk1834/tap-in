import { useRef, useState } from 'react'
import { useData } from '../store.jsx'

const PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'tapin-admin'

const FIELDS = [
  ['type', 'Type, e.g. Restaurant'], ['typeAr', 'Type (Arabic)'],
  ['name', 'Name'], ['nameAr', 'Name (Arabic)'],
  ['tagline', 'Tagline'], ['taglineAr', 'Tagline (Arabic)'],
  ['phone', 'Phone number'], ['whatsapp', 'WhatsApp number (digits with country code)'],
  ['address', 'Address (used for Directions)'], ['hours', 'Opening hours'],
  ['instagram', 'Instagram URL'], ['facebook', 'Facebook URL'],
  ['tiktok', 'TikTok URL'], ['reviews', 'Google reviews URL'],
]

const blank = () => ({
  id: 'place-' + Math.random().toString(36).slice(2, 7),
  type: '', typeAr: '', name: 'New place', nameAr: '', tagline: '', taglineAr: '',
  phone: '', whatsapp: '', address: '', hours: '', instagram: '', facebook: '', tiktok: '', reviews: '',
  offers: [], menu: [],
})

function Field({ label, value, onChange }) {
  return (
    <label className="fld">
      <span>{label}</span>
      <input value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

export default function Admin() {
  const { data, update, replace, reset } = useData()
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('tapin-admin') === '1')
  const [pw, setPw] = useState('')
  const [bad, setBad] = useState(false)
  const [sel, setSel] = useState(0)
  const [confirm, setConfirm] = useState(false)
  const [msg, setMsg] = useState('')
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
          {bad && <p className="msg">Wrong password.</p>}
          <button className="btn" type="submit">Sign in</button>
        </form>
      </div>
    )
  }

  const p = sel === 'site' ? null : data.places[sel]
  const link = `${location.origin}/place/${p?.id}`

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
    if (!f) return
    f.text().then((txt) => {
      try {
        const d = JSON.parse(txt)
        if (!Array.isArray(d.places) || !d.site) throw new Error()
        replace(d); setSel(0); setMsg('Imported.')
      } catch { setMsg('That file is not a valid places.json.') }
    })
    e.target.value = ''
  }
  const copy = () => {
    navigator.clipboard?.writeText(link).then(() => setMsg('Link copied.'), () => setMsg('Copy failed. Select the link and copy it.'))
  }
  const setField = (k, v) => update((d) => { d.places[sel][k] = v })
  const setRow = (list, j, k, v) => update((d) => { d.places[sel][list][j][k] = v })

  return (
    <div className="adm">
      <div className="side">
        {data.places.map((x, i) => (
          <button key={x.id} className={'li' + (sel === i ? ' on' : '')} type="button" onClick={() => { setSel(i); setConfirm(false) }}>
            {x.name || 'Untitled'}
          </button>
        ))}
        <button className={'li' + (sel === 'site' ? ' on' : '')} type="button" onClick={() => setSel('site')}>Site settings</button>
        <button className="li add" type="button" onClick={() => { update((d) => { d.places.push(blank()) }); setSel(data.places.length) }}>+ Add place</button>
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
            {FIELDS.map(([k, label]) => <Field key={k} label={label} value={p[k]} onChange={(v) => setField(k, v)} />)}

            <h3>Offers</h3>
            {(p.offers || []).map((o, j) => (
              <div className="row o" key={j}>
                <input placeholder="Title" value={o.t} onChange={(e) => setRow('offers', j, 't', e.target.value)} />
                <input placeholder="Details" value={o.d} onChange={(e) => setRow('offers', j, 'd', e.target.value)} />
                <button className="sm d" type="button" onClick={() => update((d) => { d.places[sel].offers.splice(j, 1) })}>Remove</button>
              </div>
            ))}
            <button className="sm" type="button" onClick={() => update((d) => { (d.places[sel].offers ||= []).push({ t: '', d: '' }) })}>+ Add offer</button>

            <h3>Menu</h3>
            {(p.menu || []).map((m, j) => (
              <div className="row" key={j}>
                <input placeholder="Item" value={m.n} onChange={(e) => setRow('menu', j, 'n', e.target.value)} />
                <input placeholder="Price" value={m.p} onChange={(e) => setRow('menu', j, 'p', e.target.value)} />
                <button className="sm d" type="button" onClick={() => update((d) => { d.places[sel].menu.splice(j, 1) })}>Remove</button>
              </div>
            ))}
            <button className="sm" type="button" onClick={() => update((d) => { (d.places[sel].menu ||= []).push({ n: '', p: '' }) })}>+ Add menu item</button>

            <h3>Danger zone</h3>
            <button className="sm d" type="button" onClick={() => {
              if (!confirm) return setConfirm(true)
              update((d) => { d.places.splice(sel, 1) }); setSel(0); setConfirm(false)
            }}>{confirm ? 'Click again to delete this place' : 'Delete place'}</button>
          </div>
        ) : null}

        <div className="bar">
          <button className="btn" type="button" onClick={exportJson}>Export places.json</button>
          <button className="sm" type="button" onClick={() => fileRef.current.click()}>Import</button>
          <button className="sm d" type="button" onClick={() => { reset(); setSel(0); setMsg('Reset to the data in the repo.') }}>Reset</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importJson} />
          <span className="msg">{msg || 'Edits are saved in this browser. Export and commit places.json to publish them.'}</span>
        </div>
      </div>
    </div>
  )
}
