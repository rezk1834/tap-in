import { useEffect, useRef, useState } from 'react'
import { useData } from '../store.jsx'
import { PLATFORMS, SITE_PLATFORMS } from '../platforms.jsx'
import { SITE_SOCIALS, validateSocial, slugify, validateSlug } from '../schema.js'
import { PlaceIcon, FileIcon } from '../icons.jsx'
import { prepareLogo, prepareMenu, kb, isUrl, openFile } from '../files.js'
import { ADMIN_EMAIL, readSession, signIn, signOut, uploadFile } from '../supabase.js'

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
  ['whatsapp', 'WhatsApp', 'The WhatsApp button on this place’s page'],
]

const CATEGORIES = [['restaurant', 'Restaurant'], ['cafe', 'Café'], ['clinic', 'Clinic'], ['other', 'Other']]

const uniq = (base, places, idx = -1) => {
  let s = base, n = 2
  while (places.some((p, i) => i !== idx && (p.id === s || p.aliases.includes(s)))) s = base + '-' + n++
  return s
}
const autoSlug = (name, places, idx) => uniq(slugify(name) || 'place', places, idx)

const blank = (places) => ({
  id: autoSlug('New place', places, -1),
  category: 'other', logo: '', menuFiles: [], aliases: [],
  type: '', typeAr: '', name: 'New place', nameAr: '', tagline: '', taglineAr: '',
  whatsapp: '', address: '', hours: '', reviewLink: '',
  show: { menu: true, offers: true, links: true, reviews: true, whatsapp: true },
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

function SlugEditor({ place, places, index, link, onApply, onRemoveAlias, onCopy }) {
  const [draft, setDraft] = useState(place.id)
  const [err, setErr] = useState('')
  const changed = draft !== place.id
  const apply = () => { const e = validateSlug(draft, places, index); setErr(e); if (!e) onApply(draft) }
  return (
    <div className="fld2">
      <span className="lbl">Page address (the NFC card link)</span>
      <div className="slug">
        <span className="pre">/place/</span>
        <input aria-label="Page address" value={draft} onChange={(e) => { setDraft(e.target.value.toLowerCase().replace(/\s+/g, '-')); setErr('') }} />
      </div>
      <div className="up" style={{ marginTop: 8 }}>
        <button className="sm" type="button" onClick={() => { setDraft(slugify(place.name) || draft); setErr('') }}>Use the place name</button>
        <button className="sm" type="button" onClick={apply} disabled={!changed}>Change address</button>
      </div>
      {err && <p className="note err" role="alert">{err}</p>}
      {changed && !err && <p className="hint">Press “Change address”, then “Save changes” to publish it. Your old link will keep working.</p>}
      <div className="lk" style={{ marginTop: 10 }}>
        <input readOnly value={link} aria-label="Full link" />
        <button className="sm" type="button" onClick={onCopy}>Copy</button>
      </div>
      {place.aliases.length > 0 && (
        <p className="hint">Old links that still redirect here:{' '}
          {place.aliases.map((a) => (
            <span className="chip" key={a}>/place/{a}<button type="button" aria-label={`Stop redirecting /place/${a}`} onClick={() => onRemoveAlias(a)}>×</button></span>
          ))}
        </p>
      )}
    </div>
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

function SocialSettings({ saved, onSave, remote }) {
  const [draft, setDraft] = useState(() => saved.map((s) => ({ ...s })))
  const [errs, setErrs] = useState({})
  const [fb, setFb] = useState(null)
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)

  const edit = (i, k, v) => {
    setDraft((d) => d.map((s, j) => (j === i ? { ...s, [k]: v } : s)))
    setErrs((e) => ({ ...e, [draft[i].platform]: '' }))
    setFb(null)
  }
  const save = () => {
    const e = {}
    draft.forEach((s) => {
      const url = s.url.trim()
      if (s.platform === 'whatsapp') return
      if (!url) { if (s.enabled) e[s.platform] = 'Enter a link, or switch this platform off.' }
      else { const m = validateSocial(s.platform, url); if (m) e[s.platform] = m }
    })
    setErrs(e)
    const n = Object.keys(e).length
    if (n) return setFb({ kind: 'err', text: `Not saved. Fix ${n} link${n > 1 ? 's' : ''} and try again.` })
    onSave(draft.map((s) => ({ ...s, url: s.url.trim() })))
    setFb({ kind: 'ok', text: remote ? 'Social links applied. Press “Save changes” at the bottom of the page to publish them.' : 'Social links saved. They now show on the site wherever they are enabled.' })
  }
  const restore = () => {
    setDraft(SITE_SOCIALS.map((s) => ({ ...s })))
    setErrs({})
    setFb({ kind: 'info', text: 'Default links restored. Press Save to apply them.' })
  }

  return (
    <>
      <h3>Official social media</h3>
      <p className="hint" style={{ marginTop: 0 }}>Shown in the site footer, next to the WhatsApp icon. The Instagram link also powers the “Contact Us on Instagram” button.</p>
      {draft.map((s, i) => {
        const P = SITE_PLATFORMS.find((x) => x.id === s.platform)
        const err = errs[s.platform]
        return (
          <div className="srow" key={s.platform}>
            <div className="sname"><span className="sico"><P.Icon /></span><b>{P.label}</b></div>
            <label className="tg">
              <input type="checkbox" role="switch" aria-label={`Show ${P.label} on the public site`} checked={s.enabled} onChange={(e) => edit(i, 'enabled', e.target.checked)} />
              <span className="sw" />
              <span className="tgt"><b>{s.enabled ? 'On' : 'Off'}</b></span>
            </label>
            {s.platform === 'whatsapp' ? (
              <p className="hint" style={{ margin: 0 }}>Uses the main WhatsApp number above.</p>
            ) : <input aria-label={`${P.label} link`} aria-invalid={!!err} aria-describedby={err ? 'err-' + s.platform : undefined} inputMode="url" placeholder="https://..." value={s.url} onChange={(e) => edit(i, 'url', e.target.value)} />}
            {err && <p className="note err" id={'err-' + s.platform}>{err}</p>}
          </div>
        )
      })}
      <div className="up" style={{ marginTop: 12 }}>
        <button className="btn" type="button" onClick={save} disabled={!dirty} style={{ padding: '12px 24px' }}>Save social links</button>
        <button className="sm" type="button" onClick={restore}>Restore defaults</button>
        {dirty && !fb && <span className="hint" style={{ margin: 0 }}>You have unsaved changes.</span>}
      </div>
      <Note n={fb} />
    </>
  )
}

const Note = ({ n }) => (n ? <p className={'note ' + n.kind} role="status">{n.text}</p> : null)

export default function Admin() {
  const { data, update, replace, reset, save, registerUpload, isSaved, storageError, remote, status, dirty } = useData()
  const [session, setSession] = useState(() => (remote ? readSession() : null))
  const [authed, setAuthed] = useState(() => !remote && sessionStorage.getItem('tapin-admin') === '1')
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pw, setPw] = useState('')
  const [bad, setBad] = useState('')
  const [sel, setSel] = useState(0)
  const [confirm, setConfirm] = useState(false)
  const [msg, setMsg] = useState('')
  const [up, setUp] = useState({})
  const [rev, setRev] = useState(0)
  const fileRef = useRef(null)
  const loggedIn = remote ? !!session : authed

  // warn before leaving with edits that were not saved to the database
  useEffect(() => {
    if (!remote || !dirty) return
    const h = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [remote, dirty])

  if (!loggedIn) {
    return (
      <div className="pg">
        <h2>Dashboard</h2>
        <form onSubmit={async (e) => {
          e.preventDefault()
          setBad('')
          if (!remote) {
            if (pw === PASS) { sessionStorage.setItem('tapin-admin', '1'); setAuthed(true) } else setBad('Wrong password.')
            return
          }
          setBusy(true)
          try { setSession(await signIn(email.trim(), pw)); setPw('') }
          catch (err) { setBad(/invalid login/i.test(err.message) ? 'Wrong email or password.' : 'Could not sign in: ' + err.message) }
          setBusy(false)
        }}>
          {remote && (
            <label className="fld"><span>Email</span>
              <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
          )}
          <label className="fld"><span>Password</span>
            <input type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
          </label>
          {bad && <p className="note err" role="alert">{bad}</p>}
          <button className="btn" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </div>
    )
  }

  const p = sel === 'site' ? null : data.places[sel]
  const link = `${location.origin}/place/${encodeURIComponent(p?.id || '')}`
  const choose = (i) => { setSel(i); setConfirm(false); setUp({}) }

  // a brand-new place keeps its page address in step with its name until it is first saved
  const setField = (k, v) => update((d) => {
    const pl = d.places[sel]
    if (k === 'name' && !isSaved(pl.id) && pl.id === autoSlug(pl.name, d.places, sel)) pl.id = autoSlug(v, d.places, sel)
    pl[k] = v
  })
  const applySlug = (slug) => update((d) => {
    const pl = d.places[sel], old = pl.id
    pl.aliases = pl.aliases.filter((a) => a !== slug)
    if (old !== slug && isSaved(old) && !pl.aliases.includes(old)) pl.aliases.push(old)
    pl.id = slug
  })
  const moveFile = (j, dir) => update((d) => { const a = d.places[sel].menuFiles; [a[j], a[j + dir]] = [a[j + dir], a[j]] })
  const removeFile = (j) => update((d) => { d.places[sel].menuFiles.splice(j, 1) })
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
    if (remote) {
      try {
        note('logo', 'info', 'Uploading…')
        const url = await uploadFile(await (await fetch(r.data)).blob(), 'logos')
        registerUpload(url)
        setField('logo', url)
        note('logo', 'ok', 'Logo uploaded. Press “Save changes” to publish it.')
      } catch (err) { note('logo', 'err', 'Upload failed: ' + err.message) }
      return
    }
    setField('logo', r.data)
    note('logo', 'ok', `Logo uploaded (${kb(r.data.length)}). It now shows on the card and the place page.`)
  }
  const onMenu = async (e) => {
    const files = [...e.target.files]; e.target.value = ''
    if (!files.length) return
    const idx = sel
    note('menu', 'info', `Processing ${files.length} file${files.length > 1 ? 's' : ''}…`)
    const added = [], errors = []
    for (const f of files) {
      const r = await prepareMenu(f, remote ? { max: 8 * 1024 * 1024, read: false } : {})
      if (r.error) { errors.push(`${f.name}: ${r.error}`); continue }
      if (!remote) { added.push(r.file); continue }
      try { const url = await uploadFile(f, 'menus'); registerUpload(url); added.push({ name: f.name, type: f.type, url }) }
      catch (err) { errors.push(`${f.name}: upload failed (${err.message})`) }
    }
    if (added.length) update((d) => { d.places[idx].menuFiles.push(...added) })
    note('menu', errors.length ? 'err' : 'ok', [added.length ? `Added ${added.length} file${added.length > 1 ? 's' : ''}.${remote ? ' Press “Save changes” to publish.' : ''}` : '', ...errors].filter(Boolean).join(' '))
  }

  const doSave = async () => {
    setSaving(true); setMsg('Saving…')
    const r = await save()
    setSaving(false)
    if (r.ok) return setMsg(r.warn || (r.deleted ? `Saved. The changes are live for everyone, and ${r.deleted} unused file${r.deleted > 1 ? 's were' : ' was'} deleted from storage.` : 'Saved. The changes are live for everyone.'))
    if (/session expired/i.test(r.error)) { signOut(); setSession(null); return }
    setMsg('Could not save: ' + r.error + (/row-level|policy|permission|jwt/i.test(r.error) ? ` Make sure you are signed in as ${ADMIN_EMAIL}.` : ''))
  }
  const logout = () => {
    if (remote) { signOut(); setSession(null) } else { sessionStorage.removeItem('tapin-admin'); setAuthed(false) }
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
        replace(d); setSel(0); setRev((r) => r + 1); setMsg('Imported.')
      } catch { setMsg('That file is not a valid places.json.') }
    })
  }
  const copy = () => {
    navigator.clipboard?.writeText(link).then(() => setMsg('Link copied.'), () => setMsg('Copy failed. Select the link and copy it.'))
  }

  const has = p && {
    menu: p.menu.some((m) => m.n) || p.menuFiles.length > 0,
    whatsapp: !!p.whatsapp,
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
        <button className="li add" type="button" onClick={() => { update((d) => { d.places.push(blank(d.places)) }); choose(data.places.length) }}>+ Add place</button>
        <button className="li" type="button" onClick={logout}>Sign out</button>
      </div>

      <div>
        {remote && status === 'empty' && <p className="banner">The database is empty, so the sample data is shown. Press “Save changes” to publish it, then edit it.</p>}
        {remote && status === 'offline' && <p className="banner err">Could not reach the database. You are seeing the last saved copy, and saving may fail.</p>}
        {sel === 'site' ? (
          <div className="panel">
            <h2>Site settings</h2>
            <Field label="Main WhatsApp number (digits with country code)" value={data.site.whatsapp} onChange={(v) => update((d) => { d.site.whatsapp = v })} />
            <SocialSettings key={rev} remote={remote} saved={data.site.socials} onSave={(socials) => update((d) => { d.site.socials = socials })} />
          </div>
        ) : p ? (
          <div className="panel">
            <h2>{p.name || 'New place'}</h2>
            <SlugEditor key={p.id} place={p} places={data.places} index={sel} link={link} onApply={applySlug} onCopy={copy}
              onRemoveAlias={(a) => update((d) => { d.places[sel].aliases = d.places[sel].aliases.filter((x) => x !== a) })} />
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
            <h4 className="subh">Menu photos and PDF files</h4>
            {p.menuFiles.length > 0 && (
              <ul className="flist">
                {p.menuFiles.map((f, j) => (
                  <li key={(f.url || f.name) + j}>
                    <span className="pv sm">{f.type.startsWith('image/') ? <img src={f.data || f.url} alt="" /> : <FileIcon />}</span>
                    <span className="fname">{f.name}</span>
                    <button className="sm" type="button" aria-label={`Move ${f.name} up`} disabled={j === 0} onClick={() => moveFile(j, -1)}>↑</button>
                    <button className="sm" type="button" aria-label={`Move ${f.name} down`} disabled={j === p.menuFiles.length - 1} onClick={() => moveFile(j, 1)}>↓</button>
                    <button className="sm" type="button" onClick={() => openFile(f)}>Preview</button>
                    <button className="sm d" type="button" onClick={() => removeFile(j)}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
            <div className="up">
              <label className="sm filebtn">{p.menuFiles.length ? 'Add more menu files' : 'Upload menu photos or PDF'}
                <input className="vh" type="file" multiple accept="application/pdf,image/png,image/jpeg,image/webp" onChange={onMenu} />
              </label>
            </div>
            <p className="hint">You can pick several photos at once. PDF, PNG, JPG or WebP, up to {remote ? '8 MB' : '1.5 MB'} each. Photos show in the order above.</p>
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
          {remote ? (
            <button className="btn" type="button" onClick={doSave} disabled={(!dirty && status !== 'empty') || saving || status === 'loading'}>{saving ? 'Saving…' : 'Save changes'}</button>
          ) : (
            <button className="btn" type="button" onClick={exportJson}>Export places.json</button>
          )}
          {remote && <button className="sm" type="button" onClick={exportJson}>Backup (JSON)</button>}
          <button className="sm" type="button" onClick={() => fileRef.current.click()}>Import</button>
          <button className="sm d" type="button" onClick={() => { reset(); choose(0); setRev((r) => r + 1); setMsg(remote ? 'Discarded unsaved changes.' : 'Reset to the data in the repo.') }}>{remote ? 'Discard changes' : 'Reset'}</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importJson} />
          <span className={'msg' + (storageError || /^Could not|^Not saved|could not be deleted/.test(msg) ? ' err' : '')} role="status">
            {storageError ? 'Browser storage is full, so recent edits are not saved. Export places.json now, or use smaller uploads.' : msg || (remote ? (dirty ? 'You have unsaved changes.' : 'Everything is saved.') : 'Edits are saved in this browser. Export and commit places.json to publish them.')}
          </span>
        </div>
      </div>
    </div>
  )
}
