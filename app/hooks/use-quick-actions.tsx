import React, { useEffect } from 'react'
import { useCallback, useState } from 'react'
import { useKey } from './use-key'
import invariant from 'tiny-invariant'
import { ActionMenu } from '@oxide/ui'
import type { QuickActionItem } from '@oxide/ui'
import create from 'zustand'

type Items = QuickActionItem[]

type StoreState = {
  items: Items
  add: (toAdd: Items) => void
  remove: (toRemove: Items) => void
}

const removeByValue = (items: Items, toRemove: Items) => {
  const valuesToRemove = new Set(toRemove.map((i) => i.value))
  return items.filter((i) => !valuesToRemove.has(i.value))
}

const useStore = create<StoreState>((set) => ({
  items: [],
  add: (toAdd) =>
    set(({ items }) => ({ items: removeByValue(items, toAdd).concat(toAdd) })),
  remove: (toRemove) => set(({ items }) => ({ items: removeByValue(items, toRemove) })),
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
  const add = useStore((state) => state.add)
  const remove = useStore((state) => state.remove)
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
  const items = useStore((state) => state.items)
  const [isOpen, setIsOpen] = useState(false)

  const anyItems = items.length > 0

  // only memoized to avoid render churn in useKey
  const openDialog = useCallback(
    (e) => {
      if (anyItems && !isOpen) {
        e.preventDefault()
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    },
    [isOpen, anyItems]
  )

  useKey('mod+k', openDialog)

  const closeDialog = useCallback(() => setIsOpen(false), [])

  return (
    <ActionMenu
      isOpen={isOpen}
      onDismiss={closeDialog}
      ariaLabel="Quick actions"
      items={items}
    />
  )
}
