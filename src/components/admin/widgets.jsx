import { useState } from 'react'
import { useData } from '../../store.jsx'
import { slugify, validateSlug } from '../../schema.js'
import { ImageIcon } from '../../icons.jsx'
import { prepareImage } from '../../files.js'
import { uploadFile } from '../../supabase.js'

export const Note = ({ n }) => (n ? <p className={'note ' + n.kind} role="status">{n.text}</p> : null)

// A switch. `mini` is the small version used next to a field to show or hide it on the public page.
export function Toggle({ label, hint, checked, onChange, mini, aria }) {
  return (
    <label className={'tg' + (mini ? ' mini' : '')}>
      <input type="checkbox" role="switch" aria-label={aria} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="sw" />
      <span className="tgt"><b>{mini ? (checked ? 'Shown' : 'Hidden') : label}</b>{hint && <small>{hint}</small>}</span>
    </label>
  )
}

const VisToggle = ({ vis, what }) => vis && <Toggle mini checked={vis.checked} onChange={vis.onChange} aria={`Show ${what} on the public page`} />

export function Field({ label, value, onChange, vis, hint, textarea, ...rest }) {
  return (
    <div className="fld2">
      <div className="lblrow"><span className="lbl">{label}</span><VisToggle vis={vis} what={label} /></div>
      {textarea
        ? <textarea rows={3} value={value || ''} onChange={(e) => onChange(e.target.value)} aria-label={label} {...rest} />
        : <input value={value || ''} onChange={(e) => onChange(e.target.value)} aria-label={label} {...rest} />}
      {hint && <p className="hint">{hint}</p>}
    </div>
  )
}

// A text in both languages. Arabic first, because Arabic is the default language of the site.
// Stored as key (English) and keyAr (Arabic) on `obj`.
export function Bi({ label, obj, k, set, vis, hint, textarea, rows = 3 }) {
  return (
    <div className="fld2">
      <div className="lblrow"><span className="lbl">{label}</span><VisToggle vis={vis} what={label} /></div>
      <div className="bi">
        {textarea
          ? <textarea rows={rows} dir="rtl" lang="ar" placeholder="العربية" aria-label={`${label} (Arabic)`} value={obj[k + 'Ar'] || ''} onChange={(e) => set(k + 'Ar', e.target.value)} />
          : <input dir="rtl" lang="ar" placeholder="العربية" aria-label={`${label} (Arabic)`} value={obj[k + 'Ar'] || ''} onChange={(e) => set(k + 'Ar', e.target.value)} />}
        {textarea
          ? <textarea rows={rows} dir="ltr" lang="en" placeholder="English" aria-label={`${label} (English)`} value={obj[k] || ''} onChange={(e) => set(k, e.target.value)} />
          : <input dir="ltr" lang="en" placeholder="English" aria-label={`${label} (English)`} value={obj[k] || ''} onChange={(e) => set(k, e.target.value)} />}
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  )
}

// Uploads an image: Supabase Storage when configured, otherwise stored inside the data (data URL)
export function useUploader() {
  const { remote, registerUpload } = useData()
  return async (file, opts) => {
    const r = await prepareImage(file, opts)
    if (r.error) return r
    if (!remote) return { url: r.data }
    try {
      const url = await uploadFile(await (await fetch(r.data)).blob(), opts.folder || 'images')
      registerUpload(url)
      return { url }
    } catch (err) { return { error: 'Upload failed: ' + err.message } }
  }
}

export function ImageField({ label, value, onChange, folder, max, kind, hint, vis, wide }) {
  const upload = useUploader()
  const { remote } = useData()
  const [note, setNote] = useState(null)
  const pick = async (e) => {
    const f = e.target.files[0]; e.target.value = ''
    if (!f) return
    setNote({ kind: 'info', text: 'Processing…' })
    const r = await upload(f, { folder, max, kind })
    if (r.error) return setNote({ kind: 'err', text: r.error })
    onChange(r.url)
    setNote({ kind: 'ok', text: remote ? 'Uploaded. Press “Save changes” to publish it.' : 'Image added.' })
  }
  return (
    <div className="fld2">
      <div className="lblrow"><span className="lbl">{label}</span><VisToggle vis={vis} what={label} /></div>
      <div className="up">
        <span className={'pv' + (wide ? ' wide' : '')}>{value ? <img src={value} alt={`Current ${label}`} /> : <ImageIcon />}</span>
        <label className="sm filebtn">{value ? 'Replace' : 'Upload'}
          <input className="vh" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={pick} />
        </label>
        {value && <button className="sm d" type="button" onClick={() => { onChange(''); setNote({ kind: 'ok', text: 'Removed.' }) }}>Remove</button>}
      </div>
      {hint && <p className="hint">{hint}</p>}
      <Note n={note} />
    </div>
  )
}

// A list of items. Every item can be shown or hidden, moved up or down, and removed. Shows an empty state when there are none.
export function ListEditor({ items, empty, addLabel, onAdd, onMove, onRemove, onToggle, title, children, extra }) {
  return (
    <>
      {items.length === 0 && <p className="empty2">{empty}</p>}
      {items.map((it, i) => (
        <div className={'li2' + (it.show === false ? ' off' : '')} key={it.id || i}>
          <div className="lh">
            <b className="grow">{(title && title(it, i)) || `#${i + 1}`}</b>
            <Toggle mini checked={it.show !== false} onChange={() => onToggle(i)} aria={`Show item ${i + 1} on the public page`} />
            <button className="sm" type="button" aria-label="Move up" disabled={i === 0} onClick={() => onMove(i, -1)}>↑</button>
            <button className="sm" type="button" aria-label="Move down" disabled={i === items.length - 1} onClick={() => onMove(i, 1)}>↓</button>
            <button className="sm d" type="button" onClick={() => onRemove(i)}>Remove</button>
          </div>
          {children(it, i)}
        </div>
      ))}
      <div className="up">
        <button className="sm" type="button" onClick={onAdd}>{addLabel}</button>
        {extra}
      </div>
    </>
  )
}

// A collapsible group of settings
export function Card({ title, note, children, open }) {
  return (
    <details className="card" open={open}>
      <summary><span>{title}</span>{note && <span className="cnt">{note}</span>}</summary>
      <div className="cb">{children}</div>
    </details>
  )
}

export function SlugEditor({ place, places, index, link, onApply, onRemoveAlias, onCopy }) {
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

// A tiny wireframe that shows what a layout looks like
export function Wire({ id }) {
  const f = 'currentColor'
  const shapes = {
    profile: <><rect x="0" y="0" width="80" height="20" opacity=".25" /><circle cx="40" cy="20" r="8" fill={f} /><rect x="14" y="34" width="52" height="4" /><rect x="6" y="42" width="30" height="12" opacity=".4" /><rect x="44" y="42" width="30" height="12" opacity=".4" /></>,
    links: <><circle cx="40" cy="10" r="7" fill={f} /><rect x="22" y="22" width="36" height="3" /><rect x="14" y="30" width="52" height="7" rx="3.5" opacity=".6" /><rect x="14" y="40" width="52" height="7" rx="3.5" opacity=".6" /><rect x="14" y="50" width="52" height="7" rx="3.5" opacity=".6" /></>,
    menu: <><rect x="0" y="0" width="80" height="14" opacity=".25" /><rect x="8" y="20" width="40" height="3" /><rect x="60" y="20" width="12" height="3" opacity=".5" /><rect x="8" y="29" width="34" height="3" /><rect x="60" y="29" width="12" height="3" opacity=".5" /><rect x="8" y="38" width="44" height="3" /><rect x="60" y="38" width="12" height="3" opacity=".5" /><rect x="8" y="47" width="30" height="3" /><rect x="60" y="47" width="12" height="3" opacity=".5" /></>,
    catalog: <><rect x="6" y="6" width="32" height="22" opacity=".45" /><rect x="42" y="6" width="32" height="22" opacity=".45" /><rect x="6" y="31" width="32" height="22" opacity=".45" /><rect x="42" y="31" width="32" height="22" opacity=".45" /><rect x="6" y="55" width="20" height="3" /><rect x="42" y="55" width="20" height="3" /></>,
    services: <><rect x="6" y="6" width="68" height="14" rx="3" opacity=".35" /><rect x="6" y="24" width="68" height="14" rx="3" opacity=".35" /><rect x="6" y="42" width="68" height="14" rx="3" opacity=".35" /><rect x="10" y="10" width="6" height="6" /><rect x="10" y="28" width="6" height="6" /><rect x="10" y="46" width="6" height="6" /></>,
    gallery: <><rect x="4" y="4" width="22" height="24" opacity=".45" /><rect x="29" y="4" width="22" height="24" opacity=".45" /><rect x="54" y="4" width="22" height="24" opacity=".45" /><rect x="4" y="31" width="22" height="24" opacity=".45" /><rect x="29" y="31" width="22" height="24" opacity=".45" /><rect x="54" y="31" width="22" height="24" opacity=".45" /></>,
    contact: <><rect x="6" y="6" width="68" height="12" rx="3" opacity=".5" /><rect x="6" y="22" width="68" height="12" rx="3" opacity=".5" /><rect x="6" y="38" width="68" height="12" rx="3" opacity=".5" /><rect x="6" y="54" width="40" height="3" /></>,
  }
  return <svg className="wire" viewBox="0 0 80 60" fill="currentColor" aria-hidden="true">{shapes[id]}</svg>
}
