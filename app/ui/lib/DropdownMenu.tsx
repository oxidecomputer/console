/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  Content,
  Item,
  Portal,
  Root,
  Trigger,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
} from '@radix-ui/react-dropdown-menu'
import cn from 'classnames'
import { forwardRef, type ForwardedRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

type DivRef = ForwardedRef<HTMLDivElement>

// remove possibility of disabling links for now. if we put it back, make sure
// to forwardRef on LinkItem so the disabled tooltip can work
type LinkitemProps = Omit<DropdownMenuItemProps, 'disabled'> & { to: string }

export const DropdownMenu = {
  Root: ({ children }: { children: ReactNode }) => <Root modal={false}>{children}</Root>,
  Trigger,
  Portal,
  // don't need to forward ref here for a particular reason but Radix gives a
  // big angry warning if we don't
  Content: forwardRef(({ className, ...props }: DropdownMenuContentProps, ref: DivRef) => (
    <Content
      {...props}
      // prevents focus ring showing up on trigger when you close the menu
      onCloseAutoFocus={(e) => e.preventDefault()}
      className={cn('DropdownMenuContent', className)}
      ref={ref}
    />
  )),
  // need to forward ref because of tooltips on disabled menu buttons
  Item: forwardRef(({ className, ...props }: DropdownMenuItemProps, ref: DivRef) => (
    <Item {...props} className={cn('DropdownMenuItem ox-menu-item', className)} ref={ref} />
  )),
  LinkItem: ({ className, children, to, ...props }: LinkitemProps) => (
    <Item {...props} className={cn('DropdownMenuItem ox-menu-item', className)} asChild>
      <Link to={to}>{children}</Link>
    </Item>
  ),
}
