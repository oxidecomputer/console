import type {
  DropdownMenuContentProps,
  DropdownMenuItemProps,
} from '@radix-ui/react-dropdown-menu'
import { Content, Item, Portal, Root, Trigger } from '@radix-ui/react-dropdown-menu'
import cn from 'classnames'
import { type ForwardedRef, forwardRef } from 'react'

type DivRef = ForwardedRef<HTMLDivElement>

export const DropdownMenu = {
  Root,
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
}
