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
import { type ReactNode, type Ref } from 'react'
import { Link } from 'react-router'

import { Wrap } from '../util/wrap'
import { Tooltip } from './Tooltip'

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

type LinkItemProps = {
  className?: string
  to: string
  children: string | React.ReactElement
}

export function LinkItem({ className, to, children }: LinkItemProps) {
  // rather lazy test for external links
  const ext = /^https?:/.test(to) ? { rel: 'noreferrer', target: '_blank' } : {}
  // TODO: external link icon to show when it will open in a new tab
  return (
    <MenuItem>
      <Link className={cn('DropdownMenuItem ox-menu-item', className)} to={to} {...ext}>
        {children}
      </Link>
    </MenuItem>
  )
}

type ItemProps = {
  label: string
  className?: string
  onSelect: () => void
  /* If present, ReactNode will be displayed in a tooltip */
  disabled?: React.ReactNode
  ref?: Ref<HTMLButtonElement>
}

// need to forward ref because of tooltips on disabled menu buttons
export const Item = ({ className, onSelect, label, disabled, ref }: ItemProps) => (
  <Wrap key={label} when={!!disabled} with={<Tooltip content={disabled} />}>
    <MenuItem disabled={!!disabled}>
      <button
        type="button"
        className={cn('DropdownMenuItem ox-menu-item', className)}
        ref={ref}
        onClick={onSelect}
      >
        {label}
      </button>
    </MenuItem>
  </Wrap>
)
