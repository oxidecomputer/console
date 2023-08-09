/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect } from 'react'
import { useCallback, useState } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import { create } from 'zustand'

import { ActionMenu } from '@oxide/ui'
import type { QuickActionItem } from '@oxide/ui'
import { invariant } from '@oxide/util'

import { useKey } from './use-key'

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

const useStore = create<StoreState>()((set) => ({
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
  const navigate = useNavigate()
  const location = useLocation()

  const add = useStore((state) => state.add)
  const remove = useStore((state) => state.remove)

  /*
    Adds a route to the quick actions menu if a condition is met
    This allows us to add routes without declaring it in every instance
    of `useQuickActions`. If `include` is true the item is included
  */
  const conditions = [
    {
      // matchPath returns null if there is no match
      // only show settings link if the user is not already on that page
      include: matchPath('/settings/:route', location.pathname) === null,
      item: {
        navGroup: 'User',
        value: 'Settings',
        onSelect: () => navigate('/settings/profile'),
      },
    },
  ]

  const globalItems = conditions
    .filter((condition) => condition.include)
    .map((condition) => condition.item)

  useEffect(() => {
    invariant(
      itemsToAdd.length === new Set(itemsToAdd.map((i) => i.value)).size,
      'Items being added to the list of quick actions must have unique `value` values.'
    )
    add([...itemsToAdd, ...globalItems])
    return () => remove(itemsToAdd)
  }, [itemsToAdd, add, remove, navigate, location.pathname, globalItems])
}

export function QuickActions() {
  const items = useStore((state) => state.items)
  // TODO: move open state into store to make it easier to toggle from elsewhere
  const [isOpen, setIsOpen] = useState(false)

  const anyItems = items.length > 0

  // only memoized to avoid render churn in useKey
  const openDialog = useCallback(
    (e: Mousetrap.ExtendedKeyboardEvent) => {
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
      aria-label="Quick actions"
      items={items}
    />
  )
}
