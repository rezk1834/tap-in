import { useEffect, useState } from 'react'
import { useData } from '../../store.jsx'
import { FONTS, FONT_BY, PAIRINGS, ROLES, activePairing, loadFont, stackOf, supports } from '../../fontLibrary.js'

const AR = 'أهلاً بك في تاب إن، اطلب الآن ١٢٣'
const EN = 'Welcome to Tap In, order now 123'
const SCRIPT = { ar: 'Arabic', latin: 'Latin', both: 'Arabic + Latin' }

function Sample({ stack, bold, small }) {
  return (
    <div style={{ fontFamily: stack, fontWeight: bold ? 700 : 400, fontSize: small ? '.9rem' : '1.1rem' }}>
      <div dir="rtl" lang="ar">{AR}</div>
      <div dir="ltr" lang="en">{EN}</div>
    </div>
  )
}

export default function FontLibrary() {
  const { data, update } = useData()
  const roles = data.site.fonts.roles
  const [script, setScript] = useState('all')
  const [use, setUse] = useState('any')
  useEffect(() => { FONTS.forEach((f) => loadFont(f.name)) }, []) // browsing the library previews every font
  const current = activePairing(roles)

  const setRole = (role, key, name) => update((d) => { d.site.fonts.roles[role][key] = name })
  const applyPairing = (pr) => update((d) => { d.site.fonts.roles = JSON.parse(JSON.stringify(pr.roles)) })
  const applyFont = (f, target) => update((d) => {
    const rs = target === 'all' ? ROLES.map((r) => r[0]) : [target]
    rs.forEach((r) => {
      if (supports(f, 'ar')) d.site.fonts.roles[r].ar = f.name
      if (supports(f, 'latin')) d.site.fonts.roles[r].en = f.name
    })
  })

  const list = FONTS.filter((f) => (script === 'all' || f.script === script) && (use === 'any' || f.use.includes(use)))

  return (
    <div className="panel">
      <h2>Fonts and typography</h2>
      <p className="hint" style={{ marginTop: 0 }}>
        Choose fonts for the whole public site. Each role has an Arabic font and a Latin font: Latin letters and numbers use the Latin font, Arabic letters use the Arabic font.
        Press “Save changes” at the bottom of the page to publish. Fonts load from Google Fonts only when they are in use.
      </p>

      <h3>Ready-made Arabic and English pairings</h3>
      <div className="fcards">
        {PAIRINGS.map((pr) => (
          <div className={'fcard' + (current && current.id === pr.id ? ' on' : '')} key={pr.id}>
            <b>{pr.name}</b>
            <small>{pr.desc}</small>
            <Sample stack={stackOf(pr.roles.heading)} bold small />
            <Sample stack={stackOf(pr.roles.body)} small />
            <button className="sm" type="button" onClick={() => applyPairing(pr)} disabled={!!current && current.id === pr.id}>{current && current.id === pr.id ? 'In use' : 'Use this pairing'}</button>
          </div>
        ))}
      </div>

      <h3>Fonts by role</h3>
      {!current && <p className="hint" style={{ marginTop: 0 }}>You are using a custom combination.</p>}
      {ROLES.map(([r, label, desc]) => (
        <div className="role" key={r}>
          <div className="rl"><b>{label}</b><small>{desc}</small></div>
          <div className="g2">
            <label className="fld"><span>Arabic font</span>
              <select value={roles[r].ar} onChange={(e) => setRole(r, 'ar', e.target.value)}>
                {FONTS.filter((f) => supports(f, 'ar')).map((f) => <option key={f.name} value={f.name}>{f.name}{f.use.includes(r) ? '' : ' (not ideal here)'}</option>)}
              </select>
            </label>
            <label className="fld"><span>Latin font (English, numbers)</span>
              <select value={roles[r].en} onChange={(e) => setRole(r, 'en', e.target.value)}>
                {FONTS.filter((f) => supports(f, 'latin')).map((f) => <option key={f.name} value={f.name}>{f.name}{f.use.includes(r) ? '' : ' (not ideal here)'}</option>)}
              </select>
            </label>
          </div>
          <Sample stack={stackOf(roles[r])} bold={r === 'heading' || r === 'button'} small={r === 'label'} />
        </div>
      ))}

      <h3>Font library</h3>
      <div className="up" style={{ marginBottom: 12 }}>
        <label className="fld" style={{ margin: 0 }}><span>Script</span>
          <select value={script} onChange={(e) => setScript(e.target.value)}>
            <option value="all">All fonts</option><option value="ar">Arabic only</option><option value="latin">Latin only</option><option value="both">Arabic + Latin in one font</option>
          </select>
        </label>
        <label className="fld" style={{ margin: 0 }}><span>Suited for</span>
          <select value={use} onChange={(e) => setUse(e.target.value)}>
            <option value="any">Any role</option>
            {ROLES.map(([r, label]) => <option key={r} value={r}>{label}</option>)}
          </select>
        </label>
        <span className="hint" style={{ margin: 0 }}>{list.length} fonts</span>
      </div>
      <div className="fcards">
        {list.map((f) => (
          <div className="fcard" key={f.name}>
            <b>{f.name}</b>
            <small>{SCRIPT[f.script]} · {f.kind}</small>
            <Sample stack={stackOf(f.script === 'ar' ? { ar: f.name } : f.script === 'latin' ? { en: f.name } : { ar: f.name, en: f.name })} />
            <small>{f.note}</small>
            <div className="tags">{f.use.map((u) => <span className="tag" key={u}>{(ROLES.find((r) => r[0] === u) || [u, u])[1]}</span>)}</div>
            <select aria-label={`Use ${f.name} for…`} value="" onChange={(e) => e.target.value && applyFont(f, e.target.value)}>
              <option value="">Use for…</option>
              <option value="all">All roles</option>
              {ROLES.map(([r, label]) => <option key={r} value={r}>{label}</option>)}
            </select>
          </div>
        ))}
        {list.length === 0 && <p className="empty2">No fonts match these filters.</p>}
      </div>
    </div>
  )
}
