import { createContext, useContext, useEffect, useRef, useState } from 'react'
import raw from './data/places.json'
import { normalize, imagesOf } from './schema.js'
import { enabled as remote, fetchAll, saveAll, storagePath, deleteFiles } from './supabase.js'

// With Supabase configured, visitors read the database and the admin saves to it (live for everyone).
// Without it, the site falls back to src/data/places.json and a browser-only draft (export + commit).
const LOCAL_KEY = 'tapin-data-v1'
const CACHE_KEY = 'tapin-remote-cache-v1'
const base = normalize(raw)
const Ctx = createContext(null)

function readLocal() {
  try { const s = localStorage.getItem(LOCAL_KEY); if (s) return normalize(JSON.parse(s)) } catch {}
  return base
}
function readCache() {
  try { const s = localStorage.getItem(CACHE_KEY); if (s) return normalize(JSON.parse(s)) } catch {}
  return null
}
const writeCache = (d) => { try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)) } catch {} }

// Every Supabase Storage file a data set points to (logos, covers, gallery, product and menu files)
function refsOf(d) {
  const s = new Set()
  d.places.forEach((p) => imagesOf(p).forEach((u) => { if (u && storagePath(u)) s.add(u) }))
  return s
}

export function DataProvider({ children }) {
  // remote: show the last cached copy instantly (or nothing, never the demo data), then refresh from the database
  const [data, setData] = useState(() => (remote ? readCache() || { ...base, places: [] } : readLocal()))
  const [status, setStatus] = useState(remote ? 'loading' : 'local') // loading | ready | empty | offline | local
  const [dirty, setDirty] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const dirtyRef = useRef(false)
  const remoteIds = useRef(new Set())   // place ids that exist in the database
  const savedRefs = useRef(new Set())   // storage files used by the saved copy
  const uploaded = useRef(new Set())    // storage files uploaded in this session

  const load = () => {
    setStatus('loading')
    return fetchAll().then((r) => {
      if (dirtyRef.current) return
      if (!r.places.length && !r.site) { // database never seeded: show the sample data so the admin can publish it
        setData(base); setStatus('empty'); return
      }
      const d = normalize({ site: r.site || base.site, places: r.places })
      remoteIds.current = new Set(d.places.map((p) => p.id))
      savedRefs.current = refsOf(d)
      setData(d); writeCache(d); setStatus('ready')
    }).catch(() => {
      if (dirtyRef.current) return
      setData((d) => (d.places.length ? d : base)); setStatus('offline')
    })
  }
  useEffect(() => { if (remote) load() }, [])

  // local mode only: keep the draft in this browser
  useEffect(() => {
    if (remote || data === base) return
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); setStorageError(false) } catch { setStorageError(true) }
  }, [data])

  const touch = () => { dirtyRef.current = true; setDirty(true) }
  const update = (fn) => { touch(); setData((d) => { const n = structuredClone(d); fn(n); return n }) }
  const replace = (d) => { touch(); setData(normalize(d)) }
  const registerUpload = (url) => { uploaded.current.add(url) }
  // has this page address been published already? (old addresses are kept as redirects only if so)
  const isSaved = (id) => (remote ? remoteIds.current.has(id) : base.places.some((p) => p.id === id))

  const reset = () => {
    dirtyRef.current = false; setDirty(false)
    if (remote) {
      // files uploaded during this unsaved session are not used by the saved copy: delete them
      const orphans = [...uploaded.current].filter((u) => !savedRefs.current.has(u)).map(storagePath).filter(Boolean)
      uploaded.current = new Set()
      deleteFiles(orphans).catch(() => {})
      return load()
    }
    try { localStorage.removeItem(LOCAL_KEY) } catch {}
    setData(base); setStorageError(false)
  }

  const save = async () => {
    try {
      const removed = [...remoteIds.current].filter((id) => !data.places.some((p) => p.id === id))
      await saveAll(data, removed)
      remoteIds.current = new Set(data.places.map((p) => p.id))
      writeCache(data)
      dirtyRef.current = false; setDirty(false); setStatus('ready')
    } catch (e) { return { ok: false, error: e.message || 'Unknown error' } }

    // Database saved. Now delete files that are no longer used (replaced, removed, or belonged to a deleted place).
    const now = refsOf(data)
    const doomed = [...new Set([...savedRefs.current, ...uploaded.current])].filter((u) => !now.has(u))
    savedRefs.current = now
    uploaded.current = new Set()
    try { await deleteFiles(doomed.map(storagePath).filter(Boolean)) }
    catch (e) { return { ok: true, warn: `Saved, but ${doomed.length} unused file(s) could not be deleted from storage: ${e.message}` } }
    return { ok: true, deleted: doomed.length }
  }

  return <Ctx.Provider value={{ data, update, replace, reset, save, registerUpload, isSaved, storageError, remote, status, dirty }}>{children}</Ctx.Provider>
}

export const useData = () => useContext(Ctx)
