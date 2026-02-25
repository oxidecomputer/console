// Set theme before first paint to prevent flash of wrong color scheme.
// Mirrors logic in app/stores/theme.ts. Must stay in sync.
;(function () {
  var p = 'dark'
  try {
    var raw = localStorage.getItem('theme-preference')
    var stored = raw ? JSON.parse(raw) : null
    // match zustand persist format
    if (stored && stored.state && stored.state.theme) p = stored.state.theme
  } catch (_e) {}
  if (p === 'system')
    p = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  document.documentElement.dataset.theme = p
})()
