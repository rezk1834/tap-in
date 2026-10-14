import { createContext, useContext, useEffect, useState } from 'react'
import raw from './data/places.json'
import { normalize } from './schema.js'

// Visitors always read src/data/places.json (the file in your repo).
// The dashboard saves edits in this browser only; export the JSON and commit it to publish.
const KEY = 'tapin-data-v1'
const base = normalize(raw)
const Ctx = createContext(null)

function load() {
  try {
    const s = localStorage.getItem(KEY)
    if (s) return normalize(JSON.parse(s))
  } catch {}
  return base
}

export function DataProvider({ children }) {
  const [data, setData] = useState(load)
  const [storageError, setStorageError] = useState(false)
  useEffect(() => {
    if (data === base) return
    try { localStorage.setItem(KEY, JSON.stringify(data)); setStorageError(false) }
    catch { setStorageError(true) } // browser storage full: the user must export
  }, [data])
  const update = (fn) => setData((d) => { const n = structuredClone(d); fn(n); return n })
  const replace = (d) => setData(normalize(d))
  const reset = () => { try { localStorage.removeItem(KEY) } catch {}; setData(base); setStorageError(false) }
  return <Ctx.Provider value={{ data, update, replace, reset, storageError }}>{children}</Ctx.Provider>
}

export const useData = () => useContext(Ctx)
