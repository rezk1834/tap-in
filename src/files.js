// Upload validation + helpers. Files are stored inside places.json as data URLs,
// so the limits keep the JSON (and the browser's ~5 MB storage) small.
export const isUrl = (u) => /^https?:\/\//i.test((u || '').trim())
export const kb = (bytes) => (bytes / 1024 < 1000 ? Math.round(bytes / 1024) + ' KB' : (bytes / 1048576).toFixed(1) + ' MB')

const IMG_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
const MENU_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
const LOGO_MAX_INPUT = 3 * 1024 * 1024
const SVG_MAX = 200 * 1024
const MENU_MAX = 1.5 * 1024 * 1024

const readDataUrl = (file) => new Promise((res, rej) => {
  const r = new FileReader()
  r.onload = () => res(r.result)
  r.onerror = () => rej(new Error('read'))
  r.readAsDataURL(file)
})

function loadImage(src) {
  return new Promise((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = () => rej(new Error('decode'))
    i.src = src
  })
}

// Any image (logo, cover, gallery, product...). Rasters are resized to `max` pixels on the long side.
// kind 'logo' keeps transparency (PNG); other kinds become compact JPEGs.
export async function prepareImage(file, { max = 1200, kind = 'photo', maxInput = 8 * 1024 * 1024 } = {}) {
  if (!IMG_TYPES.includes(file.type)) return { error: 'Unsupported file. Upload a PNG, JPG, WebP or SVG image.' }
  if (file.size > maxInput) return { error: `That image is ${kb(file.size)}. The maximum is ${kb(maxInput)}.` }
  try {
    const url = await readDataUrl(file)
    if (file.type === 'image/svg+xml') {
      if (file.size > SVG_MAX) return { error: `That SVG is ${kb(file.size)}. The maximum for SVG is 200 KB.` }
      return { data: url }
    }
    const img = await loadImage(url)
    const k = Math.min(1, max / Math.max(img.width, img.height))
    const c = document.createElement('canvas')
    c.width = Math.max(1, Math.round(img.width * k))
    c.height = Math.max(1, Math.round(img.height * k))
    const ctx = c.getContext('2d')
    if (kind !== 'logo') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height) }
    ctx.drawImage(img, 0, 0, c.width, c.height)
    return { data: kind === 'logo' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.82) }
  } catch {
    return { error: 'That file could not be read as an image. Try a different file.' }
  }
}

export const prepareLogo = (file) => prepareImage(file, { max: 512, kind: 'logo', maxInput: LOGO_MAX_INPUT })

export async function prepareMenu(file, { max = MENU_MAX, read = true } = {}) {
  if (!MENU_TYPES.includes(file.type)) return { error: 'Unsupported file. Upload a PDF, PNG, JPG or WebP.' }
  if (file.size > max) return { error: `That file is ${kb(file.size)}. The maximum is ${kb(max)}. Compress the PDF or use a smaller image.` }
  try {
    return { file: { name: file.name, type: file.type, ...(read ? { data: await readDataUrl(file) } : {}) } }
  } catch {
    return { error: 'That file could not be read. Try again.' }
  }
}

// Browsers block navigating straight to data: URLs, so open uploaded files through a blob URL.
export function openFile(f) {
  if (f.url) return openUrl(f.url)
  const bin = atob(f.data.split(',')[1])
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  const url = URL.createObjectURL(new Blob([bytes], { type: f.type }))
  openUrl(url)
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

function openUrl(url) {
  const a = document.createElement('a')
  a.href = url; a.target = '_blank'; a.rel = 'noopener'
  document.body.appendChild(a); a.click(); a.remove()
}
