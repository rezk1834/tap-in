import { createContext, useContext, useEffect, useState } from 'react'

// index.html sets data-theme and the text size before first paint (saved choice, else the system setting).
const Ctx = createContext(null)

// Text size steps. 1 is the normal size. The choice is remembered.
export const SIZES = [0.85, 1, 1.15, 1.3, 1.5]
const DEFAULT_SIZE = 1

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')
  const [size, setSize] = useState(() => {
    try { const i = Number(localStorage.getItem('fs')); return Number.isInteger(i) && i >= 0 && i < SIZES.length ? i : DEFAULT_SIZE } catch { return DEFAULT_SIZE }
  })
  useEffect(() => {
    document.documentElement.style.setProperty('--fs', String(SIZES[size]))
    try { localStorage.setItem('fs', String(size)) } catch {}
  }, [size])
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('theme', next) } catch {}
    setTheme(next)
  }
  const bigger = () => setSize((s) => Math.min(SIZES.length - 1, s + 1))
  const smaller = () => setSize((s) => Math.max(0, s - 1))
  return <Ctx.Provider value={{ theme, toggle, size, bigger, smaller, canBigger: size < SIZES.length - 1, canSmaller: size > 0 }}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)
