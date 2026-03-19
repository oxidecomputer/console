/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// Set theme before first paint to prevent flash of wrong color scheme.
// Mirrors logic in app/stores/theme.ts. Must stay in sync.
;(function () {
  // Resolve preference from localStorage (zustand persist format)
  var pref = 'dark'
  try {
    var raw = localStorage.getItem('theme-preference')
    var stored = raw ? JSON.parse(raw) : null
    if (stored && stored.state && stored.state.theme) pref = stored.state.theme
  } catch (_e) {}

  var systemIsLight = matchMedia('(prefers-color-scheme: light)').matches
  var resolvedPref = pref === 'system' ? (systemIsLight ? 'light' : 'dark') : pref

  // Keep in sync with FORCE_DARK_PATHS in app/stores/theme.ts
  var forceDarkPaths = ['/login/', '/device/']
  var forceDark = forceDarkPaths.some((p) => location.pathname.startsWith(p))

  document.documentElement.dataset.theme = forceDark ? 'dark' : resolvedPref
})()
