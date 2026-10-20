import { useState } from 'react'
import { LangScope } from '../../i18n.jsx'
import PlaceView from '../PlaceView.jsx'

// Live preview of the place being edited, including edits that are not saved yet.
export default function Preview({ place, link }) {
  const [lang, setLang] = useState('ar')
  const [wide, setWide] = useState(false)
  return (
    <aside className="prev" aria-label="Preview">
      <div className="prevbar">
        <b>Preview</b>
        <div className="seg" role="group" aria-label="Preview language">
          <button type="button" aria-pressed={lang === 'ar'} onClick={() => setLang('ar')}>العربية</button>
          <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button>
        </div>
        <div className="seg" role="group" aria-label="Preview width">
          <button type="button" aria-pressed={!wide} onClick={() => setWide(false)}>Phone</button>
          <button type="button" aria-pressed={wide} onClick={() => setWide(true)}>Wide</button>
        </div>
      </div>
      <div className={'pvwrap' + (wide ? '' : ' phone')}>
        <div className="pvscroll" dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
          <LangScope lang={lang}><PlaceView place={place} /></LangScope>
        </div>
      </div>
      <p className="hint">This is exactly what visitors will see, including changes you have not saved yet. <a href={link} target="_blank" rel="noopener noreferrer">Open the published page</a>.</p>
    </aside>
  )
}
