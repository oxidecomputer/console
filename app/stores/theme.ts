/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useSyncExternalStore } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
 * Hook that applies the resolved theme to the document. Renders in RootLayout
 * so it runs on every page.
 */
export function useApplyTheme() {
  const { theme: pref } = useThemeStore()
  const systemIsLight = useSyncExternalStore(subscribeToMediaQuery, getSystemIsLight)
  const theme = pref === 'system' ? (systemIsLight ? 'light' : 'dark') : pref

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
}
