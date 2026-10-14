// Minimal Supabase client using fetch (no extra dependency): REST, auth and storage.
const env = import.meta.env
const URL_ = (env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
const KEY = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
export const enabled = Boolean(URL_ && KEY)
export const ADMIN_EMAIL = 'admin@tapineg.com'

const SKEY = 'tapin-session'
const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'application/pdf': 'pdf' }

async function req(path, { method = 'GET', body, headers = {}, token } = {}) {
  const h = { apikey: KEY, ...headers }
  // legacy anon keys are JWTs and can be sent as the bearer; new publishable keys go in apikey only
  const bearer = token ? 'Bearer ' + token : KEY.startsWith('eyJ') ? 'Bearer ' + KEY : null
  if (bearer) h.Authorization = bearer
  if (body !== undefined) h['Content-Type'] = 'application/json'
  const r = await fetch(URL_ + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) })
  const text = await r.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch {}
  if (!r.ok) throw new Error((json && (json.message || json.msg || json.error_description || json.error)) || r.statusText || 'Request failed')
  return json
}

/* ---------- auth ---------- */
function save(s) {
  const session = { ...s, expires_at: Date.now() + Math.max(30, (s.expires_in || 3600) - 30) * 1000 }
  try { localStorage.setItem(SKEY, JSON.stringify(session)) } catch {}
  return session
}
export function readSession() {
  try { return JSON.parse(localStorage.getItem(SKEY)) } catch { return null }
}
export async function signIn(email, password) {
  return save(await req('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } }))
}
export function signOut() {
  try { localStorage.removeItem(SKEY) } catch {}
}
export async function getToken() {
  const s = readSession()
  if (!s) return null
  if (Date.now() < s.expires_at) return s.access_token
  try {
    return save(await req('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: s.refresh_token } })).access_token
  } catch { signOut(); return null }
}

/* ---------- data ---------- */
export async function fetchAll() {
  const [places, site] = await Promise.all([
    req('/rest/v1/places?select=id,position,data&order=position.asc'),
    req('/rest/v1/site_settings?select=data&id=eq.1'),
  ])
  return { places: places.map((r) => ({ ...r.data, id: r.id })), site: site[0] ? site[0].data : null }
}

export async function saveAll(data, removedIds) {
  const token = await getToken()
  if (!token) throw new Error('Your session expired. Sign in again.')
  const up = { method: 'POST', token, headers: { Prefer: 'resolution=merge-duplicates,return=minimal' } }
  await req('/rest/v1/places?on_conflict=id', { ...up, body: data.places.map((p, i) => ({ id: p.id, position: i, data: p })) })
  await req('/rest/v1/site_settings?on_conflict=id', { ...up, body: [{ id: 1, data: data.site }] })
  if (removedIds.length) {
    const list = encodeURIComponent('(' + removedIds.map((i) => '"' + i + '"').join(',') + ')')
    await req('/rest/v1/places?id=in.' + list, { method: 'DELETE', token })
  }
}

/* ---------- storage ---------- */
export async function uploadFile(blob, folder) {
  const token = await getToken()
  if (!token) throw new Error('Your session expired. Sign in again.')
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${EXT[blob.type] || 'bin'}`
  const r = await fetch(`${URL_}/storage/v1/object/uploads/${path}`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: 'Bearer ' + token, 'Content-Type': blob.type || 'application/octet-stream' },
    body: blob,
  })
  if (!r.ok) {
    let m = ''
    try { m = (await r.json()).message } catch {}
    throw new Error(m || r.statusText || 'Upload failed')
  }
  return `${URL_}/storage/v1/object/public/uploads/${path}`
}
