import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { useData } from '../store.jsx'
import PlaceView from './PlaceView.jsx'

// Route wrapper: finds the place by its page address (or an old address) and shows it.
export default function Place() {
  const { id } = useParams()
  const { t, L } = useLang()
  const { data, status } = useData()
  const nav = useNavigate()
  const byId = data.places.find((x) => x.id === id)
  const byAlias = byId ? null : data.places.find((x) => x.aliases.includes(id))
  const p = byId || byAlias

  // an old page address (after a rename) keeps working: send the visitor to the current one
  useEffect(() => {
    if (byAlias) nav('/place/' + encodeURIComponent(byAlias.id), { replace: true })
  }, [byAlias && byAlias.id])

  // the page title only uses the name when the name is visible
  useEffect(() => {
    document.title = p && p.show.name !== false && L(p, 'name') ? `${L(p, 'name')} · Tap In` : 'Tap In'
  })

  if (!p) return <div className="pg"><p>{status === 'loading' ? t('loading') : t('nf')}</p></div>
  return <PlaceView place={p} />
}
