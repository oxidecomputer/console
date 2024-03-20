import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { create } from 'zustand'
import { shallow } from 'zustand/shallow'

import { useWindowSize } from './use-window-size'

type StoreState = {
  isOpen: boolean
}

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

export function useMenuState() {
  const { size } = useWindowSize()
  const location = useLocation()

  useEffect(() => {
    closeSidebar()
  }, [location.pathname])

  return useStore(
    (store) => ({
      isOpen: size.width >= 1024 ? true : store.isOpen,
    }),
    shallow
  )
}
