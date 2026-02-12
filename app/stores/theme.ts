/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useSyncExternalStore } from 'react'
import { create } from 'zustand'

export type ThemePreference = 'dark' | 'light' | 'system'

const STORAGE_KEY = 'theme-preference'

function getStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light' || stored === 'system') return stored
  } catch {
    // localStorage unavailable
  }
  return 'dark'
}

export const useThemeStore = create<{ preference: ThemePreference }>(() => ({
  preference: getStoredPreference(),
}))

export function setThemePreference(pref: ThemePreference) {
  localStorage.setItem(STORAGE_KEY, pref)
  useThemeStore.setState({ preference: pref })
}

/** Resolve preference to actual theme, accounting for system media query */
function resolveTheme(pref: ThemePreference, systemIsLight: boolean): 'dark' | 'light' {
  if (pref === 'system') return systemIsLight ? 'light' : 'dark'
  return pref
}

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
  const { preference } = useThemeStore()
  const systemIsLight = useSyncExternalStore(subscribeToMediaQuery, getSystemIsLight)
  const theme = resolveTheme(preference, systemIsLight)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
}
