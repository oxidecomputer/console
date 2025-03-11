/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ColumnDef } from '@tanstack/react-table'
import cn from 'classnames'
import { useMemo } from 'react'

import { More12Icon } from '@oxide/design-system/icons/react'

import { CopyIdItem } from '~/components/CopyIdItem'
import * as DropdownMenu from '~/ui/lib/DropdownMenu'

type MenuActionBase = {
  label: string
  className?: string
}

export type MenuActionItem = MenuActionBase & {
  onActivate: () => void
  disabled?: React.ReactNode
}

type MenuActionLink = MenuActionBase & {
  to: string
  disabled?: never
}

/**
 * `to` is a URL, item will be rendered a `<Link>`. `onActivate` is a callback.
 * Only the callback one can be disabled.
 */
export type MenuAction = MenuActionItem | MenuActionLink

type MakeActions<Item> = (item: Item) => Array<MenuAction>

/** Convenience helper to combine regular cols with actions col and memoize */
export function useColsWithActions<TData extends Record<string, unknown>>(
  /** Should be static or memoized */
  columns: ColumnDef<TData, any>[], // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Must be memoized to avoid re-renders */
  makeActions: MakeActions<TData>
) {
  return useMemo(() => [...columns, getActionsCol(makeActions)], [columns, makeActions])
}

export const getActionsCol = <TData extends Record<string, unknown>>(
  makeActions: MakeActions<TData>
): ColumnDef<TData> => {
  return {
    id: 'menu',
    header: '',
    meta: {
      thClassName: 'action-col',
      tdClassName: 'action-col children:p-0 w-10',
    },

    cell: ({ row }) => {
      // TODO: control flow here has always confused me, would like to straighten it out
      const actions = makeActions(row.original)
      const id = typeof row.original.id === 'string' ? row.original.id : null
      return <RowActions id={id} actions={actions} />
    },
  }
}

type RowActionsProps = {
  /** If `id` is provided, a `Copy ID` menu item will be automatically included. */
  id?: string | null
  /** Use `copyIdLabel` to override the default label (`Copy ID`). */
  copyIdLabel?: string
  actions?: MenuAction[]
}

export const RowActions = ({ id, copyIdLabel = 'Copy ID', actions }: RowActionsProps) => {
  return (
    <DropdownMenu.Root>
      {/* stopPropagation prevents clicks from toggling row select in a single select table */}
      <DropdownMenu.Trigger
        className="flex h-full w-10 items-center justify-center"
        aria-label="Row actions"
        onClick={(e) => e.stopPropagation()}
      >
        <More12Icon />
      </DropdownMenu.Trigger>
      {/* offset moves menu in from the right so it doesn't align with the table border */}
      <DropdownMenu.Content anchor={{ to: 'bottom end', offset: -6 }} className="-mt-2">
        {id && <CopyIdItem id={id} label={copyIdLabel} />}
        {actions?.map(({ className, ...action }) =>
          'to' in action ? (
            // note no destructive styling or disabled
            <DropdownMenu.LinkItem key={action.label} to={action.to} className={className}>
              {action.label}
            </DropdownMenu.LinkItem>
          ) : (
            <DropdownMenu.Item
              key={action.label}
              label={action.label}
              className={cn(className, {
                destructive: action.label.toLowerCase() === 'delete' && !action.disabled,
              })}
              onSelect={action.onActivate}
              disabled={action.disabled}
            />
          )
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
