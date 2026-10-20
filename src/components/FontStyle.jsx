import { useEffect } from 'react'
import { useData } from '../store.jsx'
import { ROLES, loadFont, stackOf } from '../fontLibrary.js'

// Applies the site's font choices: one CSS variable per role, and loads only the fonts that are in use.
export default function FontStyle() {
  const { data } = useData()
  const roles = data.site.fonts.roles
  const key = JSON.stringify(roles)
  useEffect(() => {
    const root = document.documentElement.style
    ROLES.forEach(([r]) => {
      loadFont(roles[r].ar); loadFont(roles[r].en)
      root.setProperty('--f-' + r, stackOf(roles[r]))
    })
  }, [key])
  return null
}
