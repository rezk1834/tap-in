import { createContext, useContext, useEffect, useState } from 'react'
import base from './data/places.json'

// Visitors always read src/data/places.json (the file in your repo).
// The dashboard saves edits in this browser only; export the JSON and commit it to publish.
const KEY = 'tapin-data-v1'
const Ctx = createContext(null)

function load() {
  try {
    const s = localStorage.getItem(KEY)
    if (s) return JSON.parse(s)
  } catch {}
  return base
}

export function DataProvider({ children }) {
  const [data, setData] = useState(load)
  useEffect(() => {
    if (data !== base) {
      try { localStorage.setItem(KEY, JSON.stringify(data)) } catch {}
    }
  }, [data])
  const update = (fn) => setData((d) => { const n = structuredClone(d); fn(n); return n })
  const replace = (d) => setData(d)
  const reset = () => { try { localStorage.removeItem(KEY) } catch {}; setData(base) }
  return <Ctx.Provider value={{ data, update, replace, reset }}>{children}</Ctx.Provider>
}

export const useData = () => useContext(Ctx)
