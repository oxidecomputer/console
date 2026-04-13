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

const MOBILE_BREAKPOINT = 1000

type StoreState = { isOpen: boolean }

const useStore = create<StoreState>(() => ({ isOpen: false }))

export function openSidebar() {
  useStore.setState({ isOpen: true })
}
export function closeSidebar() {
  useStore.setState({ isOpen: false })
}
export function toggleSidebar() {
  useStore.setState((state) => ({ isOpen: !state.isOpen }))
}

/** Subscribe to viewport width via matchMedia for SSR-safe breakpoint detection */
function useIsSmallScreen() {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      mql.addEventListener('change', callback)
      return () => mql.removeEventListener('change', callback)
    },
    () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches,
    // SSR fallback: assume desktop
    () => false
  )
}

export function useMenuState() {
  const isOpen = useStore((s) => s.isOpen)
  const isSmallScreen = useIsSmallScreen()
  const { pathname } = useLocation()

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isSmallScreen) closeSidebar()
  }, [pathname, isSmallScreen])

  // Close sidebar when resizing to desktop
  useEffect(() => {
    if (!isSmallScreen) closeSidebar()
  }, [isSmallScreen])

  return { isOpen, isSmallScreen }
}
