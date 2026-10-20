import { useEffect, useRef, useState } from 'react'
import { useData } from '../store.jsx'
import { SITE_PLATFORMS } from '../platforms.jsx'
import { SITE_SOCIALS, validateSocial, newPlace, autoSlug } from '../schema.js'
import { ADMIN_EMAIL, readSession, signIn, signOut } from '../supabase.js'
import { Field, Note } from './admin/widgets.jsx'
import PlaceEditor from './admin/PlaceEditor.jsx'
import FontLibrary from './admin/FontLibrary.jsx'

const PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'tapin-admin'

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

export default function Admin() {
  const { data, update, replace, reset, save, status, dirty, storageError, remote } = useData()
  const [session, setSession] = useState(() => (remote ? readSession() : null))
  const [authed, setAuthed] = useState(() => !remote && sessionStorage.getItem('tapin-admin') === '1')
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pw, setPw] = useState('')
  const [bad, setBad] = useState('')
  const [sel, setSel] = useState(0)
  const [msg, setMsg] = useState('')
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

  const p = typeof sel === 'number' ? data.places[sel] : null
  const link = `${location.origin}/place/${encodeURIComponent(p ? p.id : '')}`
  const choose = (i) => setSel(i)

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

  return (
    <div className="adm">
      <div className="side">
        {data.places.map((x, i) => (
          <button key={x.id} className={'li' + (sel === i ? ' on' : '')} type="button" onClick={() => choose(i)}>
            {x.name || x.nameAr || 'Untitled'}
          </button>
        ))}
        <button className="li add" type="button" onClick={() => { update((d) => { d.places.push(newPlace(autoSlug('New place', d.places, -1))) }); choose(data.places.length) }}>+ Add place</button>
        <button className={'li' + (sel === 'fonts' ? ' on' : '')} type="button" onClick={() => choose('fonts')}>Fonts and typography</button>
        <button className={'li' + (sel === 'site' ? ' on' : '')} type="button" onClick={() => choose('site')}>Site settings</button>
        <button className="li" type="button" onClick={logout}>Sign out</button>
      </div>

      <div className="main">
        {remote && status === 'empty' && <p className="banner">The database is empty, so the sample data is shown. Press “Save changes” to publish it, then edit it.</p>}
        {remote && status === 'offline' && <p className="banner err">Could not reach the database. You are seeing the last saved copy, and saving may fail.</p>}
        {sel === 'site' && (
          <div className="panel">
            <h2>Site settings</h2>
            <Field label="Main WhatsApp number (digits with country code)" value={data.site.whatsapp} onChange={(v) => update((d) => { d.site.whatsapp = v })} />
            <SocialSettings key={rev} remote={remote} saved={data.site.socials} onSave={(socials) => update((d) => { d.site.socials = socials })} />
          </div>
        )}
        {sel === 'fonts' && <FontLibrary />}
        {p && <PlaceEditor key={sel} sel={sel} link={link} onCopy={copy} onDeleted={() => choose(0)} />}

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
