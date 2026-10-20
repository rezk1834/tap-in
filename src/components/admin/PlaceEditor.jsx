import { useState } from 'react'
import { useData } from '../../store.jsx'
import { CATEGORIES, catOf } from '../../categories.js'
import { ACCENTS, BTN_SHAPES, LAYOUTS, LOGO_SHAPES, LOGO_SIZES, SECTIONS, layoutOf, sectionHasContent, sectionOrder, unusedSections } from '../../layouts.js'
import { BUTTON_ICONS, BUTTON_KINDS, BUTTON_PRESETS, buttonHref } from '../../buttons.js'
import { PLATFORMS } from '../../platforms.jsx'
import { autoSlug } from '../../schema.js'
import { FileIcon } from '../../icons.jsx'
import { isUrl, openFile, prepareMenu } from '../../files.js'
import { uploadFile } from '../../supabase.js'
import { Bi, Card, Field, ImageField, ListEditor, Note, SlugEditor, Toggle, Wire, useUploader } from './widgets.jsx'
import Preview from './Preview.jsx'

const TABS = [['identity', 'Identity'], ['layout', 'Layout and sections'], ['contact', 'Contact and links'], ['content', 'Content'], ['more', 'More']]
const uid = () => Math.random().toString(36).slice(2, 8)
const WHERE = { about: 'Identity', buttons: 'Contact and links', actions: 'Contact and links', socials: 'Contact and links', visit: 'Contact and links' }
const VALUE_HINT = {
  link: 'https://…', phone: 'Phone number (empty = the first phone number)', whatsapp: 'Number or link (empty = the place’s WhatsApp)',
  email: 'name@example.com', map: 'Address or map link (empty = the place’s address)',
}
const count = (n, one) => (n ? `${n} ${one}${n > 1 ? 's' : ''}` : 'Empty')

export default function PlaceEditor({ sel, link, onCopy, onDeleted }) {
  const { data, update, isSaved, remote, registerUpload } = useData()
  const p = data.places[sel]
  const [tab, setTab] = useState('identity')
  const [confirm, setConfirm] = useState(false)
  const [notes, setNotes] = useState({})
  const upload = useUploader()
  if (!p) return null

  const lay = layoutOf(p.layout)
  const supports = (id) => lay.sections.includes(id)
  const note = (k, kind, text) => setNotes((n) => ({ ...n, [k]: { kind, text } }))

  // a brand-new place keeps its page address in step with its name until it is first saved
  const set = (k, v) => update((d) => {
    const pl = d.places[sel]
    if (k === 'name' && !isSaved(pl.id) && pl.id === autoSlug(pl.name, d.places, sel)) pl.id = autoSlug(v, d.places, sel)
    pl[k] = v
  })
  const setShow = (k, v) => update((d) => { d.places[sel].show[k] = v })
  const vis = (k) => ({ checked: p.show[k] !== false, onChange: (v) => setShow(k, v) })
  const applySlug = (slug) => update((d) => {
    const pl = d.places[sel], old = pl.id
    pl.aliases = pl.aliases.filter((a) => a !== slug)
    if (old !== slug && isSaved(old) && !pl.aliases.includes(old)) pl.aliases.push(old)
    pl.id = slug
  })

  // generic list operations for any list on the place (phones, products, gallery...)
  const ops = (key) => ({
    set: (i, k, v) => update((d) => { d.places[sel][key][i][k] = v }),
    add: (item) => update((d) => { d.places[sel][key].push(item) }),
    rm: (i) => update((d) => { d.places[sel][key].splice(i, 1) }),
    move: (i, dir) => update((d) => { const a = d.places[sel][key], j = i + dir; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]] }),
    toggle: (i) => update((d) => { const it = d.places[sel][key][i]; it.show = it.show === false }),
  })
  const phones = ops('phones'), emails = ops('emails'), socials = ops('socials'), buttons = ops('buttons')
  const offers = ops('offers'), menu = ops('menu'), products = ops('products'), services = ops('services')
  const gallery = ops('gallery'), texts = ops('texts'), facts = ops('facts'), reviews = ops('reviews'), mfiles = ops('menuFiles')

  /* ---------- layout and sections ---------- */
  const order = sectionOrder(p)
  const unused = unusedSections(p)
  const suggested = layoutOf(catOf(p.category).layout)
  const moveSection = (id, dir) => update((d) => {
    const pl = d.places[sel], cur = sectionOrder(pl), i = cur.indexOf(id), j = i + dir
    if (j < 0 || j >= cur.length) return
    ;[cur[i], cur[j]] = [cur[j], cur[i]]
    pl.orders = { ...pl.orders, [pl.layout]: cur }
  })
  const toggleSection = (id, v) => update((d) => {
    const pl = d.places[sel]
    if (id.startsWith('text:')) { const t = pl.texts.find((x) => x.id === id.slice(5)); if (t) t.show = v } else pl.show[id] = v
  })
  const sectionName = (id) => {
    if (id.startsWith('text:')) { const t = p.texts.find((x) => x.id === id.slice(5)) || {}; return 'Text: ' + (t.title || t.titleAr || 'Untitled') }
    return (SECTIONS.find((s) => s.id === id) || { en: id }).en
  }
  const isOn = (id) => (id.startsWith('text:') ? (p.texts.find((x) => x.id === id.slice(5)) || {}).show !== false : p.show[id] !== false)

  /* ---------- uploads ---------- */
  const onMenu = async (e) => {
    const files = [...e.target.files]; e.target.value = ''
    if (!files.length) return
    const idx = sel
    note('menu', 'info', `Processing ${files.length} file${files.length > 1 ? 's' : ''}…`)
    const added = [], errors = []
    for (const f of files) {
      const r = await prepareMenu(f, remote ? { max: 8 * 1024 * 1024, read: false } : {})
      if (r.error) { errors.push(`${f.name}: ${r.error}`); continue }
      if (!remote) { added.push({ ...r.file, show: true }); continue }
      try { const url = await uploadFile(f, 'menus'); registerUpload(url); added.push({ name: f.name, type: f.type, url, show: true }) }
      catch (err) { errors.push(`${f.name}: upload failed (${err.message})`) }
    }
    if (added.length) update((d) => { d.places[idx].menuFiles.push(...added) })
    note('menu', errors.length ? 'err' : 'ok', [added.length ? `Added ${added.length} file${added.length > 1 ? 's' : ''}.${remote ? ' Press “Save changes” to publish.' : ''}` : '', ...errors].filter(Boolean).join(' '))
  }
  const onGallery = async (e) => {
    const files = [...e.target.files]; e.target.value = ''
    if (!files.length) return
    const idx = sel
    note('gallery', 'info', `Processing ${files.length} photo${files.length > 1 ? 's' : ''}…`)
    const added = [], errors = []
    for (const f of files) {
      const r = await upload(f, { folder: 'gallery', max: 1400 })
      if (r.error) errors.push(`${f.name}: ${r.error}`)
      else added.push({ id: uid(), url: r.url, caption: '', captionAr: '', show: true })
    }
    if (added.length) update((d) => { d.places[idx].gallery.push(...added) })
    note('gallery', errors.length ? 'err' : 'ok', [added.length ? `Added ${added.length} photo${added.length > 1 ? 's' : ''}.${remote ? ' Press “Save changes” to publish.' : ''}` : '', ...errors].filter(Boolean).join(' '))
  }

  const presets = [...BUTTON_PRESETS].sort((a, b) => Number(b.cats.includes(p.category)) - Number(a.cats.includes(p.category)))
  const addPreset = (i) => {
    const x = presets[i]
    buttons.add({ id: uid(), kind: x.kind, label: x.en, labelAr: x.ar, value: '', icon: x.icon, style: 'primary', show: true })
  }

  const cardNote = (id, n, one) => (supports(id) ? count(n, one) : 'Not shown by this layout (content kept)')

  return (
    <div className="edit">
      <div className="panel">
        <h2>{p.name || p.nameAr || 'New place'}</h2>
        <div className="tabs" role="tablist">
          {TABS.map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} className={'tab' + (tab === id ? ' on' : '')} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {tab === 'identity' && (
          <>
            <SlugEditor key={p.id} place={p} places={data.places} index={sel} link={link} onApply={applySlug} onCopy={onCopy}
              onRemoveAlias={(a) => update((d) => { d.places[sel].aliases = d.places[sel].aliases.filter((x) => x !== a) })} />
            <label className="fld"><span>Category</span>
              <select value={p.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.en} · {c.ar}</option>)}
              </select>
            </label>
            <Bi label="Name" obj={p} k="name" set={set} vis={vis('name')} />
            <Bi label="Type label" obj={p} k="type" set={set} vis={vis('type')} hint="Shown above the name, e.g. “Italian restaurant”. Leave empty to use the category name." />
            <Bi label="Short title or tagline" obj={p} k="tagline" set={set} vis={vis('tagline')} />
            <Bi label="About / description" obj={p} k="about" set={set} textarea rows={4} vis={vis('about')} hint="A short biography or description of the business." />

            <h3>Logo</h3>
            <ImageField label="Logo or profile image" value={p.logo} onChange={(v) => set('logo', v)} folder="logos" max={512} kind="logo" vis={vis('logo')}
              hint="Shown large at the top of the page. PNG with a transparent background works best. SVG up to 200 KB." />
            <div className="g2">
              <label className="fld"><span>Logo shape</span>
                <select value={p.logoShape} onChange={(e) => set('logoShape', e.target.value)}>{LOGO_SHAPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              </label>
              <label className="fld"><span>Logo size</span>
                <select value={p.logoSize} onChange={(e) => set('logoSize', e.target.value)}>{LOGO_SIZES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              </label>
            </div>
            <ImageField label="Cover image (optional)" value={p.cover} onChange={(v) => set('cover', v)} folder="covers" max={1600} wide vis={vis('cover')}
              hint="A wide photo behind the logo. A landscape image around 1600 × 600 works well." />

            <h3>Look</h3>
            <div className="fld2">
              <span className="lbl">Accent color</span>
              <div className="swatches">
                {ACCENTS.map(([id, label, color]) => (
                  <button key={id} type="button" className={'swatch' + (p.accent === id ? ' on' : '')} style={{ background: color }} aria-label={label} aria-pressed={p.accent === id} title={label} onClick={() => set('accent', id)} />
                ))}
              </div>
            </div>
            <label className="fld"><span>Button shape</span>
              <select value={p.btnShape} onChange={(e) => set('btnShape', e.target.value)}>{BTN_SHAPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </label>
          </>
        )}

        {tab === 'layout' && (
          <>
            <p className="hint" style={{ marginTop: 0 }}>Pick how the public page is built. Switching layouts never deletes anything: content a layout does not display stays saved and comes back when you switch back.</p>
            <div className="lopts" role="radiogroup" aria-label="Layout">
              {LAYOUTS.map((l) => (
                <button key={l.id} type="button" role="radio" aria-checked={p.layout === l.id} className={'lopt' + (p.layout === l.id ? ' on' : '')} onClick={() => update((d) => { d.places[sel].layout = l.id })}>
                  <Wire id={l.id} />
                  <b>{l.en}</b><span lang="ar" dir="rtl" className="arn">{l.ar}</span>
                  <small>{l.descEn}</small>
                </button>
              ))}
            </div>
            {suggested.id !== p.layout && (
              <p className="hint">For {catOf(p.category).en.toLowerCase()}, the “{suggested.en}” layout is a good fit.{' '}
                <button className="sm" type="button" onClick={() => update((d) => { d.places[sel].layout = suggested.id })}>Use it</button></p>
            )}

            <h3>Sections on this layout</h3>
            <p className="hint" style={{ marginTop: 0 }}>Turn sections on or off and change their order. A section with nothing in it never shows on the public page.</p>
            <ul className="slist2">
              {order.map((id, i) => {
                const has = sectionHasContent(p, id)
                const where = WHERE[id] || 'Content'
                return (
                  <li key={id} className={isOn(id) ? '' : 'off'}>
                    <Toggle mini checked={isOn(id)} onChange={(v) => toggleSection(id, v)} aria={`Show ${sectionName(id)}`} />
                    <span className="grow"><b>{sectionName(id)}</b>
                      <small>{has ? 'Has content' : `Empty. Add it in the “${where}” tab.`}</small></span>
                    <button className="sm" type="button" aria-label={`Move ${sectionName(id)} up`} disabled={i === 0} onClick={() => moveSection(id, -1)}>↑</button>
                    <button className="sm" type="button" aria-label={`Move ${sectionName(id)} down`} disabled={i === order.length - 1} onClick={() => moveSection(id, 1)}>↓</button>
                  </li>
                )
              })}
            </ul>
            {unused.length > 0 && (
              <div className="banner">
                <b>Saved but not shown by “{lay.en}”:</b> {unused.map((s) => s.en).join(', ')}. This content is kept. Choose a layout that displays it to show it again.
              </div>
            )}
          </>
        )}

        {tab === 'contact' && (
          <>
            <Card title="Contact buttons" note={supports('actions') ? (p.show.actions === false ? 'Hidden' : 'Shown') : 'Not shown by this layout (content kept)'} open>
              <Toggle label="Show the contact buttons section" checked={p.show.actions !== false} onChange={(v) => setShow('actions', v)} hint="WhatsApp, phone, email and directions buttons. Each one also has its own switch." />
              <Field label="WhatsApp number (digits with country code)" value={p.whatsapp} onChange={(v) => set('whatsapp', v)} vis={vis('whatsapp')} inputMode="tel" />
              <Field label="Map link (optional)" value={p.mapLink} onChange={(v) => set('mapLink', v)} inputMode="url" placeholder="https://maps.google.com/…" hint="Used for the Directions button. Empty = a map search for the address below." />
              <Toggle label="Show the Directions button" checked={p.show.directions !== false} onChange={(v) => setShow('directions', v)} hint="Needs an address or a map link." />

              <h3>Phone numbers</h3>
              <ListEditor items={p.phones} empty="No phone numbers yet. Add one to show a Call button." addLabel="+ Add phone number"
                onAdd={() => phones.add({ label: '', labelAr: '', number: '', show: true })} onMove={phones.move} onRemove={phones.rm} onToggle={phones.toggle}
                title={(x) => x.label || x.labelAr || x.number}>
                {(x, i) => (
                  <div className="g3">
                    <input dir="rtl" lang="ar" placeholder="التسمية (عربي)" aria-label="Label (Arabic)" value={x.labelAr} onChange={(e) => phones.set(i, 'labelAr', e.target.value)} />
                    <input placeholder="Label, e.g. Reception" aria-label="Label (English)" value={x.label} onChange={(e) => phones.set(i, 'label', e.target.value)} />
                    <input placeholder="+20 …" aria-label="Phone number" inputMode="tel" value={x.number} onChange={(e) => phones.set(i, 'number', e.target.value)} />
                  </div>
                )}
              </ListEditor>

              <h3>Email addresses</h3>
              <ListEditor items={p.emails} empty="No email addresses yet." addLabel="+ Add email address"
                onAdd={() => emails.add({ label: '', labelAr: '', email: '', show: true })} onMove={emails.move} onRemove={emails.rm} onToggle={emails.toggle}
                title={(x) => x.label || x.labelAr || x.email}>
                {(x, i) => (
                  <>
                    <div className="g3">
                      <input dir="rtl" lang="ar" placeholder="التسمية (عربي)" aria-label="Label (Arabic)" value={x.labelAr} onChange={(e) => emails.set(i, 'labelAr', e.target.value)} />
                      <input placeholder="Label, e.g. Sales" aria-label="Label (English)" value={x.label} onChange={(e) => emails.set(i, 'label', e.target.value)} />
                      <input placeholder="name@example.com" aria-label="Email address" inputMode="email" value={x.email} onChange={(e) => emails.set(i, 'email', e.target.value)} />
                    </div>
                    {x.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x.email.trim()) && <p className="note err">This does not look like an email address.</p>}
                  </>
                )}
              </ListEditor>
            </Card>

            <Card title="Address and hours" note={supports('visit') ? (p.show.visit === false ? 'Hidden' : 'Shown') : 'Not shown by this layout (content kept)'}>
              <Toggle label="Show the address and hours section" checked={p.show.visit !== false} onChange={(v) => setShow('visit', v)} />
              <Bi label="Address" obj={p} k="address" set={set} vis={vis('address')} />
              <Bi label="Opening hours" obj={p} k="hours" set={set} vis={vis('hours')} />
            </Card>

            <Card title="Social media and website links" note={supports('socials') ? count(p.socials.length, 'link') : 'Not shown by this layout (content kept)'}>
              <Toggle label="Show the social links section" checked={p.show.socials !== false} onChange={(v) => setShow('socials', v)} />
              <ListEditor items={p.socials} empty="No social links yet. Add Instagram, Facebook, TikTok, YouTube, LinkedIn, a website or any link." addLabel="+ Add social link"
                onAdd={() => socials.add({ platform: 'instagram', url: '', show: true })} onMove={socials.move} onRemove={socials.rm} onToggle={socials.toggle}
                title={(s) => (PLATFORMS.find((x) => x.id === s.platform) || {}).label}>
                {(s, i) => (
                  <>
                    <div className="row s">
                      <select aria-label="Platform" value={s.platform} onChange={(e) => socials.set(i, 'platform', e.target.value)}>
                        {PLATFORMS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                      </select>
                      <input placeholder="https://…" aria-label="Link" inputMode="url" value={s.url} onChange={(e) => socials.set(i, 'url', e.target.value)} />
                    </div>
                    {s.platform === 'other' && <input placeholder="Name of the platform, e.g. Snapchat" aria-label="Platform name" value={s.label || ''} onChange={(e) => socials.set(i, 'label', e.target.value)} />}
                    {s.url && !isUrl(s.url) && <p className="note err">Links must start with http:// or https://, so this one stays hidden for now.</p>}
                  </>
                )}
              </ListEditor>
            </Card>

            <Card title="Custom buttons" note={supports('buttons') ? count(p.buttons.length, 'button') : 'Not shown by this layout (content kept)'}>
              <Toggle label="Show the custom buttons section" checked={p.show.buttons !== false} onChange={(v) => setShow('buttons', v)} hint="Big buttons to any link, phone, WhatsApp, email or map. Ideal for “Order online” or “Book now”." />
              <ListEditor items={p.buttons} empty="No custom buttons yet. Start from a suggestion or add a blank button." addLabel="+ Add blank button"
                onAdd={() => buttons.add({ id: uid(), kind: 'link', label: '', labelAr: '', value: '', icon: 'auto', style: 'primary', show: true })}
                onMove={buttons.move} onRemove={buttons.rm} onToggle={buttons.toggle} title={(b) => b.label || b.labelAr}
                extra={
                  <select aria-label="Add a suggested button" value="" onChange={(e) => e.target.value !== '' && addPreset(+e.target.value)}>
                    <option value="">+ Add a suggested button…</option>
                    {presets.map((x, i) => <option key={i} value={i}>{x.en} · {x.ar}{x.cats.includes(p.category) ? ' ★' : ''}</option>)}
                  </select>
                }>
                {(b, i) => (
                  <>
                    <Bi label="Button label" obj={b} k="label" set={(k, v) => buttons.set(i, k, v)} />
                    <div className="g2">
                      <label className="fld"><span>Goes to</span>
                        <select value={b.kind} onChange={(e) => buttons.set(i, 'kind', e.target.value)}>{BUTTON_KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                      </label>
                      <label className="fld"><span>Style</span>
                        <select value={b.style} onChange={(e) => buttons.set(i, 'style', e.target.value)}><option value="primary">Filled</option><option value="outline">Outline</option></select>
                      </label>
                    </div>
                    <Field label="Destination" value={b.value} onChange={(v) => buttons.set(i, 'value', v)} placeholder={VALUE_HINT[b.kind]} />
                    <label className="fld"><span>Icon</span>
                      <select value={b.icon} onChange={(e) => buttons.set(i, 'icon', e.target.value)}>
                        {BUTTON_ICONS.map((v) => <option key={v} value={v}>{v === 'auto' ? 'Automatic (by destination)' : v === 'none' ? 'No icon' : v}</option>)}
                      </select>
                    </label>
                    {(b.label || b.labelAr || b.value) && !buttonHref(b, p) && <p className="note err">This button stays hidden on the public page until its destination is valid.</p>}
                  </>
                )}
              </ListEditor>
            </Card>
          </>
        )}

        {tab === 'content' && (
          <>
            <Card title="Offers" note={cardNote('offers', p.offers.length, 'offer')}>
              <Toggle label="Show the offers section" checked={p.show.offers !== false} onChange={(v) => setShow('offers', v)} />
              <ListEditor items={p.offers} empty="No offers yet." addLabel="+ Add offer" onAdd={() => offers.add({ t: '', tAr: '', d: '', dAr: '', show: true })}
                onMove={offers.move} onRemove={offers.rm} onToggle={offers.toggle} title={(o) => o.t || o.tAr}>
                {(o, i) => (<><Bi label="Title" obj={o} k="t" set={(k, v) => offers.set(i, k, v)} /><Bi label="Details" obj={o} k="d" set={(k, v) => offers.set(i, k, v)} /></>)}
              </ListEditor>
            </Card>

            <Card title="Menu" note={cardNote('menu', p.menu.length + p.menuFiles.length, 'item')}>
              <Toggle label="Show the menu section" checked={p.show.menu !== false} onChange={(v) => setShow('menu', v)} />
              <ListEditor items={p.menu} empty="No menu items yet. Add items, or upload menu photos or a PDF below." addLabel="+ Add menu item"
                onAdd={() => menu.add({ n: '', nAr: '', d: '', dAr: '', g: '', gAr: '', p: '', show: true })} onMove={menu.move} onRemove={menu.rm} onToggle={menu.toggle} title={(m) => m.n || m.nAr}>
                {(m, i) => (
                  <>
                    <Bi label="Item name" obj={m} k="n" set={(k, v) => menu.set(i, k, v)} />
                    <Bi label="Description (optional)" obj={m} k="d" set={(k, v) => menu.set(i, k, v)} />
                    <div className="g2">
                      <Field label="Price" value={m.p} onChange={(v) => menu.set(i, 'p', v)} placeholder="95 EGP" />
                    </div>
                    <Bi label="Group heading (optional)" obj={m} k="g" set={(k, v) => menu.set(i, k, v)} hint="Items under the same heading are grouped, e.g. “Drinks”. Put them next to each other." />
                  </>
                )}
              </ListEditor>
              <h4 className="subh">Menu photos and PDF files</h4>
              <ListEditor items={p.menuFiles} empty="No menu photos or PDF files yet." addLabel="" onAdd={() => {}} onMove={mfiles.move} onRemove={mfiles.rm} onToggle={mfiles.toggle}
                title={(f) => f.name} extra={
                  <>
                    <label className="sm filebtn">{p.menuFiles.length ? 'Add more menu files' : 'Upload menu photos or PDF'}
                      <input className="vh" type="file" multiple accept="application/pdf,image/png,image/jpeg,image/webp" onChange={onMenu} />
                    </label>
                  </>
                }>
                {(f) => (
                  <div className="up">
                    <span className="pv sm">{f.type.startsWith('image/') ? <img src={f.data || f.url} alt="" /> : <FileIcon />}</span>
                    <button className="sm" type="button" onClick={() => openFile(f)}>Preview</button>
                  </div>
                )}
              </ListEditor>
              <p className="hint">You can pick several files at once. PDF, PNG, JPG or WebP, up to {remote ? '8 MB' : '1.5 MB'} each.</p>
              <Note n={notes.menu} />
            </Card>

            <Card title="Products" note={cardNote('products', p.products.length, 'product')}>
              <Toggle label="Show the products section" checked={p.show.products !== false} onChange={(v) => setShow('products', v)} />
              <ListEditor items={p.products} empty="No products yet. Add your first product with a photo and a price." addLabel="+ Add product"
                onAdd={() => products.add({ id: uid(), name: '', nameAr: '', desc: '', descAr: '', price: '', img: '', link: '', show: true })}
                onMove={products.move} onRemove={products.rm} onToggle={products.toggle} title={(x) => x.name || x.nameAr}>
                {(x, i) => (
                  <>
                    <Bi label="Product name" obj={x} k="name" set={(k, v) => products.set(i, k, v)} />
                    <Bi label="Description (optional)" obj={x} k="desc" set={(k, v) => products.set(i, k, v)} />
                    <div className="g2">
                      <Field label="Price" value={x.price} onChange={(v) => products.set(i, 'price', v)} placeholder="250 EGP" />
                      <Field label="Link (optional)" value={x.link} onChange={(v) => products.set(i, 'link', v)} inputMode="url" placeholder="https://…" />
                    </div>
                    {x.link && !isUrl(x.link) && <p className="note err">Links must start with http:// or https://, so the link stays hidden.</p>}
                    <ImageField label="Photo" value={x.img} onChange={(v) => products.set(i, 'img', v)} folder="products" max={900} />
                  </>
                )}
              </ListEditor>
            </Card>

            <Card title="Services" note={cardNote('services', p.services.length, 'service')}>
              <Toggle label="Show the services section" checked={p.show.services !== false} onChange={(v) => setShow('services', v)} />
              <ListEditor items={p.services} empty="No services yet. Add what you offer, with a price if you like." addLabel="+ Add service"
                onAdd={() => services.add({ id: uid(), name: '', nameAr: '', desc: '', descAr: '', price: '', img: '', link: '', show: true })}
                onMove={services.move} onRemove={services.rm} onToggle={services.toggle} title={(x) => x.name || x.nameAr}>
                {(x, i) => (
                  <>
                    <Bi label="Service name" obj={x} k="name" set={(k, v) => services.set(i, k, v)} />
                    <Bi label="Description (optional)" obj={x} k="desc" set={(k, v) => services.set(i, k, v)} />
                    <div className="g2">
                      <Field label="Price (optional)" value={x.price} onChange={(v) => services.set(i, 'price', v)} placeholder="From 300 EGP" />
                      <Field label="Booking link (optional)" value={x.link} onChange={(v) => services.set(i, 'link', v)} inputMode="url" placeholder="https://…" />
                    </div>
                    {x.link && !isUrl(x.link) && <p className="note err">Links must start with http:// or https://, so the link stays hidden.</p>}
                    <ImageField label="Photo (optional)" value={x.img} onChange={(v) => services.set(i, 'img', v)} folder="services" max={600} />
                  </>
                )}
              </ListEditor>
            </Card>

            <Card title="Gallery" note={cardNote('gallery', p.gallery.length, 'photo')}>
              <Toggle label="Show the gallery section" checked={p.show.gallery !== false} onChange={(v) => setShow('gallery', v)} />
              <ListEditor items={p.gallery} empty="No photos yet. Upload several photos at once." addLabel="+ Add one photo slot"
                onAdd={() => gallery.add({ id: uid(), url: '', caption: '', captionAr: '', show: true })}
                onMove={gallery.move} onRemove={gallery.rm} onToggle={gallery.toggle} title={(g) => g.caption || g.captionAr}
                extra={
                  <label className="sm filebtn">Add several photos
                    <input className="vh" type="file" multiple accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onGallery} />
                  </label>
                }>
                {(g, i) => (
                  <>
                    <ImageField label="Photo" value={g.url} onChange={(v) => gallery.set(i, 'url', v)} folder="gallery" max={1400} />
                    <Bi label="Caption (optional)" obj={g} k="caption" set={(k, v) => gallery.set(i, k, v)} />
                  </>
                )}
              </ListEditor>
              <Note n={notes.gallery} />
              {!remote && <p className="hint">Without Supabase, photos are stored inside the data file, so keep them few and small. Use Supabase for large galleries.</p>}
            </Card>

            <Card title="Custom text sections" note={supports('texts') ? count(p.texts.length, 'section') : 'Not shown by this layout (content kept)'}>
              <p className="hint" style={{ marginTop: 0 }}>Free text blocks: a story, policies, delivery terms, anything. Each one has its own switch and can be reordered in the “Layout and sections” tab.</p>
              <ListEditor items={p.texts} empty="No custom text sections yet." addLabel="+ Add text section"
                onAdd={() => texts.add({ id: uid(), title: '', titleAr: '', body: '', bodyAr: '', show: true })}
                onMove={texts.move} onRemove={texts.rm} onToggle={texts.toggle} title={(x) => x.title || x.titleAr}>
                {(x, i) => (<><Bi label="Title" obj={x} k="title" set={(k, v) => texts.set(i, k, v)} /><Bi label="Text" obj={x} k="body" textarea rows={4} set={(k, v) => texts.set(i, k, v)} /></>)}
              </ListEditor>
            </Card>

            <Card title="Business info (label and value)" note={cardNote('facts', p.facts.length, 'row')}>
              <Toggle label="Show the business info section" checked={p.show.facts !== false} onChange={(v) => setShow('facts', v)} hint="Short facts such as “Delivery: free over 500 EGP” or “Parking: available”." />
              <ListEditor items={p.facts} empty="No business info yet." addLabel="+ Add info row"
                onAdd={() => facts.add({ id: uid(), label: '', labelAr: '', value: '', valueAr: '', show: true })}
                onMove={facts.move} onRemove={facts.rm} onToggle={facts.toggle} title={(f) => f.label || f.labelAr}>
                {(f, i) => (<><Bi label="Label" obj={f} k="label" set={(k, v) => facts.set(i, k, v)} /><Bi label="Value" obj={f} k="value" set={(k, v) => facts.set(i, k, v)} /></>)}
              </ListEditor>
            </Card>

            <Card title="Reviews" note={cardNote('reviews', p.reviews.length, 'review')}>
              <Toggle label="Show the reviews section" checked={p.show.reviews !== false} onChange={(v) => setShow('reviews', v)} />
              <Field label="Link for “Leave a review” (e.g. Google reviews)" value={p.reviewLink} onChange={(v) => set('reviewLink', v)} inputMode="url" />
              {p.reviewLink && !isUrl(p.reviewLink) && <p className="note err">Links must start with http:// or https://</p>}
              <ListEditor items={p.reviews} empty="No reviews yet." addLabel="+ Add review" onAdd={() => reviews.add({ name: '', rating: 5, text: '', show: true })}
                onMove={reviews.move} onRemove={reviews.rm} onToggle={reviews.toggle} title={(r) => r.name}>
                {(r, i) => (
                  <>
                    <div className="g2">
                      <input placeholder="Customer name" aria-label="Customer name" value={r.name} onChange={(e) => reviews.set(i, 'name', e.target.value)} />
                      <select aria-label="Rating" value={r.rating} onChange={(e) => reviews.set(i, 'rating', +e.target.value)}>
                        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
                      </select>
                    </div>
                    <textarea rows={2} placeholder="What the customer said" aria-label="Review text" value={r.text} onChange={(e) => reviews.set(i, 'text', e.target.value)} />
                  </>
                )}
              </ListEditor>
            </Card>
          </>
        )}

        {tab === 'more' && (
          <>
            <h3 style={{ marginTop: 0 }}>Danger zone</h3>
            <p className="hint">Deleting a place removes all of its content and its uploaded files after you press “Save changes”. Its NFC link will stop working.</p>
            <button className="sm d" type="button" onClick={() => {
              if (!confirm) return setConfirm(true)
              update((d) => { d.places.splice(sel, 1) }); onDeleted()
            }}>{confirm ? 'Click again to delete this place' : 'Delete place'}</button>
          </>
        )}
      </div>
      <Preview place={p} link={link} />
    </div>
  )
}
