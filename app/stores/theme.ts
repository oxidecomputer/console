/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Pages that should always render in dark mode. Keep in sync with
 *  public/theme-init.js.
 */
const FORCE_DARK_PATHS = ['/login/', '/device/']

export type Theme = 'dark' | 'light' | 'system'

type ThemeStore = {
  theme: Theme
  setTheme: (pref: Theme) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (pref) => set({ theme: pref }),
    }),
    { name: 'theme-preference' }
  )
)

function subscribeToMediaQuery(cb: () => void) {
  const mql = window.matchMedia('(prefers-color-scheme: light)')
  mql.addEventListener('change', cb)
  return () => mql.removeEventListener('change', cb)
}

function getSystemIsLight() {
  return window.matchMedia('(prefers-color-scheme: light)').matches
}

/**
 * Run `cb` whenever the resolved theme (data-theme on <html>) changes. Use for
 * canvas renderers that can't consume CSS custom properties directly. Returns
 * an unsubscribe function.
 */
export function subscribeToTheme(cb: () => void) {
  const observer = new MutationObserver(cb)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  return () => observer.disconnect()
}

/**
 * Hook that applies the resolved theme to the document. Renders in RootLayout
 * so it runs on every page.
 */
export function useApplyTheme() {
  const { theme: pref } = useThemeStore()
  const systemIsLight = useSyncExternalStore(subscribeToMediaQuery, getSystemIsLight)
  const resolvedPref = pref === 'system' ? (systemIsLight ? 'light' : 'dark') : pref

  const { pathname } = useLocation()
  const forceDark = FORCE_DARK_PATHS.some((p) => pathname.startsWith(p))

  const theme = forceDark ? 'dark' : resolvedPref

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
}
