/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { create } from 'zustand'

import { ActionMenu, type QuickActionItem } from '@oxide/ui'
import { invariant } from '@oxide/util'

import { useGlobalKey } from './use-key'

type Items = QuickActionItem[]

type StoreState = {
  items: Items
  isOpen: boolean
  add: (toAdd: Items) => void
  remove: (toRemove: Items) => void
  open: () => void
  close: () => void
}

const removeByValue = (items: Items, toRemove: Items) => {
  const valuesToRemove = new Set(toRemove.map((i) => i.value))
  return items.filter((i) => !valuesToRemove.has(i.value))
}

export const useQuickActionsStore = create<StoreState>((set) => ({
  items: [],
  isOpen: false,
  add: (toAdd) =>
    set(({ items }) => ({ items: removeByValue(items, toAdd).concat(toAdd) })),
  remove: (toRemove) => set(({ items }) => ({ items: removeByValue(items, toRemove) })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))

/**
 * Register action items with the global quick actions menu. `itemsToAdd` must
 * be memoized by the caller, otherwise the effect will run too often.
 *
 * The idea here is that any component in the tree can register actions to go in
 * the menu and having them appear when the component is mounted and not appear
 * when the component is unmounted Just Works.
 */
export function useQuickActions(itemsToAdd: QuickActionItem[]) {
  const navigate = useNavigate()
  const location = useLocation()

  const add = useQuickActionsStore((state) => state.add)
  const remove = useQuickActionsStore((state) => state.remove)

  /*
    Adds a route to the quick actions menu if a condition is met
    This allows us to add routes without declaring it in every instance
    of `useQuickActions`. If `include` is true the item is included
  */
  const conditions = [
    {
      // matchPath returns null if there is no match
      // only show settings link if the user is not already on that page
      include: !location.pathname.startsWith('/settings/'),
      item: {
        navGroup: 'User',
        value: 'Settings',
        onSelect: () => navigate('/settings/profile'),
      },
    },
  ]

  // TODO: this is new on every render, fix that
  const globalItems = conditions
    .filter((condition) => condition.include)
    .map((condition) => condition.item)

  useEffect(() => {
    const allItems = [...itemsToAdd, ...globalItems]
    invariant(
      allItems.length === new Set(allItems.map((i) => i.value)).size,
      'Items being added to the list of quick actions must have unique `value` values.'
    )
    add(allItems)
    return () => remove(allItems)
  }, [itemsToAdd, globalItems, add, remove, navigate, location.pathname])
}

export function QuickActions() {
  const { items, isOpen, open, close } = useQuickActionsStore((state) => ({
    items: state.items,
    isOpen: state.isOpen,
    open: state.open,
    close: state.close,
  }))

  const anyItems = items.length > 0

  // only memoized to avoid render churn in useKey
  const openDialog = useCallback(
    (e: Mousetrap.ExtendedKeyboardEvent) => {
      if (anyItems && !isOpen) {
        e.preventDefault()
        open()
      } else {
        close()
      }
    },
    [isOpen, anyItems, open, close]
  )

  useGlobalKey('mod+k', openDialog)

  return (
    <ActionMenu
      isOpen={isOpen}
      onDismiss={close}
      aria-label="Quick actions"
      items={items}
    />
  )
}
