/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { create } from 'zustand'
import { shallow } from 'zustand/shallow'

import { useWindowSize } from './use-window-size'

type StoreState = {
  isOpen: boolean
  isSmallScreen: boolean
}

const useStore = create<StoreState>(() => ({ isOpen: false, isSmallScreen: false }))

export function openSidebar() {
  useStore.setState({ isOpen: true })
}

export function closeSidebar() {
  useStore.setState({ isOpen: false })
}

export function toggleSidebar() {
  useStore.setState((state) => ({ isOpen: !state.isOpen }))
}

export function useMenuState() {
  const { size } = useWindowSize()
  const location = useLocation()

  useEffect(() => {
    closeSidebar()
  }, [location.pathname])

  return useStore(
    (store) => ({
      isOpen: store.isOpen,
      isSmallScreen: size.width < 1024,
    }),
    shallow
  )
}
