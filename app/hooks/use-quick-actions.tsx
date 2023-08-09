/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect } from 'react'
import { useCallback } from 'react'
import { create } from 'zustand'

import { ActionMenu } from '@oxide/ui'
import type { QuickActionItem } from '@oxide/ui'
import { invariant } from '@oxide/util'

import { useKey } from './use-key'

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
  isOpen: false, // Initial value
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
  const add = useQuickActionsStore((state) => state.add)
  const remove = useQuickActionsStore((state) => state.remove)
  useEffect(() => {
    invariant(
      itemsToAdd.length === new Set(itemsToAdd.map((i) => i.value)).size,
      'Items being added to the list of quick actions must have unique `value` values.'
    )
    add(itemsToAdd)
    return () => remove(itemsToAdd)
  }, [itemsToAdd, add, remove])
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
        open() // Use open from the store
      } else {
        close() // Use close from the store
      }
    },
    [isOpen, anyItems, open, close]
  )

  useKey('mod+k', openDialog)

  return (
    <ActionMenu
      isOpen={isOpen}
      onDismiss={close}
      aria-label="Quick actions"
      items={items}
    />
  )
}
