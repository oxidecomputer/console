import type {
  DropdownMenuContentProps,
  DropdownMenuItemProps,
} from '@radix-ui/react-dropdown-menu'
import { Content, Item, Portal, Root, Trigger } from '@radix-ui/react-dropdown-menu'
import cn from 'classnames'
import { type ForwardedRef, forwardRef } from 'react'

export const DropdownMenu = {
  Root,
  Trigger,
  Portal,
  Content: ({ className, ...props }: DropdownMenuContentProps) => (
    <Content
      // prevents focus ring showing up on trigger when you close the menu
      onCloseAutoFocus={(e) => e.preventDefault()}
      className={cn('DropdownMenuContent', className)}
      {...props}
    />
  ),
  // need to forward ref because of tooltips on disabled menu buttons
  Item: forwardRef(
    ({ className, ...props }: DropdownMenuItemProps, ref: ForwardedRef<HTMLDivElement>) => (
      <Item
        {...props}
        className={cn('DropdownMenuItem ox-menu-item', className)}
        ref={ref}
      />
    )
  ),
}
