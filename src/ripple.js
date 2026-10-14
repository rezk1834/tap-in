// Tap ripple: draws an expanding ring where the finger touched the element.
export function ripple(e) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  const d = document.createElement('span')
  d.className = 'dot'
  d.style.left = (e.clientX ? e.clientX - r.left : r.width / 2) + 'px'
  d.style.top = (e.clientY ? e.clientY - r.top : r.height / 2) + 'px'
  el.appendChild(d)
  setTimeout(() => d.remove(), 700)
}
