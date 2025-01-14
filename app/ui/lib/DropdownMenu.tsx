/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  type MenuItemsProps,
} from '@headlessui/react'
import cn from 'classnames'
import { forwardRef, type ForwardedRef, type ReactNode } from 'react'
import { Link } from 'react-router'

export const Root = Menu

export const Trigger = MenuButton

type ContentProps = {
  className?: string
  children: ReactNode
  anchor?: MenuItemsProps['anchor']
  /** Spacing in px, passed as --anchor-gap */
  gap?: 8
}

export function Content({ className, children, anchor = 'bottom end', gap }: ContentProps) {
  return (
    <MenuItems
      anchor={anchor}
      // goofy gap because tailwind hates string interpolation
      className={cn(
        'dropdown-menu-content elevation-2',
        gap === 8 && `[--anchor-gap:8px]`,
        className
      )}
      // necessary to turn off scroll locking so the scrollbar doesn't pop in
      // and out as menu closes and opens
      modal={false}
    >
      {children}
    </MenuItems>
  )
}

type LinkItemProps = { className?: string; to: string; children: ReactNode }

export function LinkItem({ className, to, children }: LinkItemProps) {
  return (
    <MenuItem>
      <Link className={cn('DropdownMenuItem ox-menu-item', className)} to={to}>
        {children}
      </Link>
    </MenuItem>
  )
}

type ButtonRef = ForwardedRef<HTMLButtonElement>
type ItemProps = {
  className?: string
  onSelect?: () => void
  children: ReactNode
  disabled?: boolean
}

// need to forward ref because of tooltips on disabled menu buttons
export const Item = forwardRef(
  ({ className, onSelect, children, disabled }: ItemProps, ref: ButtonRef) => (
    <MenuItem disabled={disabled}>
      <button
        type="button"
        className={cn('DropdownMenuItem ox-menu-item', className)}
        ref={ref}
        onClick={onSelect}
      >
        {children}
      </button>
    </MenuItem>
  )
)
