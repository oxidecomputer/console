/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useId, useMemo } from 'react'
import { useLocation } from 'react-router'
import { create } from 'zustand'

import { useCrumbs } from '~/hooks/use-crumbs'
import { useCurrentUser } from '~/hooks/use-current-user'
import { ActionMenu, type QuickActionItem } from '~/ui/lib/ActionMenu'
import { pb } from '~/util/path-builder'

import { useKey } from './use-key'

export type { QuickActionItem }

type StoreState = {
  // Multiple useQuickActions() hooks are active simultaneously — e.g., a
  // layout registers "Create project" while a nested page registers "Create
  // instance." Each caller is called a source and gets its own slot keyed by
  // React useId(), so when a page unmounts, its cleanup removes only its items,
  // leaving the layout's items intact. The map is flattened into a single list
  // at render time.
  itemsBySource: Map<string, QuickActionItem[]>
  isOpen: boolean
}

const useStore = create<StoreState>(() => ({ itemsBySource: new Map(), isOpen: false }))

// zustand docs say it's fine not to put your setters in the store
// https://github.com/pmndrs/zustand/blob/0426978/docs/guides/practice-with-no-store-actions.md

// These create a new Map each time because zustand uses reference equality to
// detect changes — mutating in place wouldn't trigger a re-render.
function setSourceItems(sourceId: string, items: QuickActionItem[]) {
  useStore.setState(({ itemsBySource }) => {
    const next = new Map(itemsBySource)
    next.set(sourceId, items)
    return { itemsBySource: next }
  })
}

function clearSource(sourceId: string) {
  useStore.setState(({ itemsBySource }) => {
    const next = new Map(itemsBySource)
    next.delete(sourceId)
    return { itemsBySource: next }
  })
}

export function openQuickActions() {
  useStore.setState({ isOpen: true })
}

function closeQuickActions() {
  useStore.setState({ isOpen: false })
}

function useGlobalActions(): QuickActionItem[] {
  const location = useLocation()
  const { me } = useCurrentUser()

  return useMemo(() => {
    const actions: QuickActionItem[] = []
    if (me.fleetViewer && !location.pathname.startsWith('/system/')) {
      actions.push({
        navGroup: 'System',
        value: 'Manage system',
        action: pb.silos(),
      })
    }
    if (!location.pathname.startsWith('/settings/')) {
      actions.push({
        navGroup: 'User',
        value: 'Settings',
        action: pb.profile(),
      })
    }
    return actions
  }, [location.pathname, me.fleetViewer])
}

/** Derive "Go up" actions from breadcrumb ancestors of the current page */
function useParentActions(): QuickActionItem[] {
  const crumbs = useCrumbs()

  return useMemo(() => {
    const navCrumbs = crumbs.filter((c) => !c.titleOnly)
    // Everything except the last crumb (the current page)
    const parentCrumbs = navCrumbs.slice(0, -1)
    return parentCrumbs.map((c) => ({
      value: c.label,
      action: c.path,
      navGroup: 'Go up',
    }))
  }, [crumbs])
}

/**
 * Register action items with the global quick actions menu. Takes a factory
 * and deps array like useMemo — the linter checks deps via additionalHooks.
 *
 * Each component instance gets its own source slot (via useId), so items are
 * cleaned up automatically when the component unmounts without affecting
 * other sources' registrations.
 */
export function useQuickActions(
  factory: () => QuickActionItem[],
  deps: React.DependencyList
) {
  const sourceId = useId()
  // Deps are checked by the linter at call sites via the additionalHooks
  // option in .oxlintrc.json, so we can safely forward them here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(factory, deps)

  useEffect(() => {
    setSourceItems(sourceId, items)
    return () => clearSource(sourceId)
  }, [sourceId, items])
}

function toggleDialog(e: Mousetrap.ExtendedKeyboardEvent) {
  const { itemsBySource, isOpen } = useStore.getState()
  if (itemsBySource.size > 0 && !isOpen) {
    e.preventDefault()
    openQuickActions()
  } else {
    closeQuickActions()
  }
}

export function QuickActions() {
  const itemsBySource = useStore((state) => state.itemsBySource)
  const isOpen = useStore((state) => state.isOpen)

  // Ambient items (global nav + breadcrumb ancestors) are computed inline
  // rather than stored, so QuickActions never writes to the store it reads.
  const globalItems = useGlobalActions()
  const parentItems = useParentActions()

  // Flatten: page items first, then layout items, then breadcrumb ancestors,
  // then global nav. Pages register after their parent layouts (a fact about
  // React Router, I think), so reversing itemsBySource puts page-level items
  // before layout-level items.
  const items = useMemo(
    () => [...itemsBySource.values()].reverse().flat().concat(parentItems, globalItems),
    [itemsBySource, globalItems, parentItems]
  )

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
