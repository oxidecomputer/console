/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { create } from 'zustand'

import { ActionMenu, type QuickActionItem } from '~/ui/lib/ActionMenu'
import { invariant } from '~/util/invariant'
import { useCurrentUser } from 'app/layouts/AuthenticatedLayout'
import { pb } from 'app/util/path-builder'

import { useKey } from './use-key'

type Items = QuickActionItem[]

type StoreState = {
  items: Items
  isOpen: boolean
}

// TODO: dedupe by group and value together so we can have, e.g., both silo and
// system utilization at the same time

// removeByValue dedupes items so they can be added as many times as we want
// without appearing in the menu multiple times
const removeByValue = (items: Items, toRemove: Items) => {
  const valuesToRemove = new Set(toRemove.map((i) => i.value))
  return items.filter((i) => !valuesToRemove.has(i.value))
}

const useStore = create<StoreState>(() => ({ items: [], isOpen: false }))

// zustand docs say it's fine not to put your setters in the store
// https://github.com/pmndrs/zustand/blob/0426978/docs/guides/practice-with-no-store-actions.md

function addActions(toAdd: Items) {
  useStore.setState(({ items }) => ({ items: removeByValue(items, toAdd).concat(toAdd) }))
}

function removeActions(toRemove: Items) {
  useStore.setState(({ items }) => ({ items: removeByValue(items, toRemove) }))
}

export function openQuickActions() {
  useStore.setState({ isOpen: true })
}

function closeQuickActions() {
  useStore.setState({ isOpen: false })
}

function useGlobalActions() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isFleetViewer } = useCurrentUser()

  return useMemo(() => {
    const actions = []
    // only add settings link if we're not on a settings page
    if (!location.pathname.startsWith('/settings/')) {
      actions.push({
        navGroup: 'User',
        value: 'Settings',
        onSelect: () => navigate(pb.profile()),
      })
    }
    if (isFleetViewer && !location.pathname.startsWith('/system/')) {
      actions.push({
        navGroup: 'System',
        value: 'Manage system',
        onSelect: () => navigate(pb.silos()),
      })
    }
    return actions
  }, [location.pathname, navigate, isFleetViewer])
}

/**
 * Register action items with the global quick actions menu. `itemsToAdd` must
 * be memoized by the caller, otherwise the effect will run too often.
 *
 * The idea here is that any component in the tree can register actions to go in
 * the menu and having them appear when the component is mounted and not appear
 * when the component is unmounted Just Works.
 */
export function useQuickActions(itemsToAdd: QuickActionItem[]) {
  const location = useLocation()

  // Add routes without declaring them in every `useQuickActions` call
  const globalItems = useGlobalActions()

  useEffect(() => {
    const allItems = [...itemsToAdd, ...globalItems]
    invariant(
      allItems.length === new Set(allItems.map((i) => i.value)).size,
      'Items being added to the list of quick actions must have unique `value` values.'
    )
    addActions(allItems)
    return () => removeActions(allItems)
  }, [itemsToAdd, globalItems, location.pathname])
}

function toggleDialog(e: Mousetrap.ExtendedKeyboardEvent) {
  const { items, isOpen } = useStore.getState()

  if (items.length > 0 && !isOpen) {
    e.preventDefault()
    openQuickActions()
  } else {
    closeQuickActions()
  }
}

export function QuickActions() {
  const items = useStore((state) => state.items)
  const isOpen = useStore((state) => state.isOpen)

  useKey('mod+k', toggleDialog, { global: true })

  return (
    <ActionMenu
      isOpen={isOpen}
      onDismiss={closeQuickActions}
      aria-label="Quick actions"
      items={items}
    />
  )
}
