import type {
  DropdownMenuContentProps,
  DropdownMenuItemProps,
} from '@radix-ui/react-dropdown-menu'
import { Content, Item, Portal, Root, Trigger } from '@radix-ui/react-dropdown-menu'
import cn from 'classnames'

export const DropdownMenu = {
  Root,
  Trigger,
  Portal,
  Content: ({ className, ...props }: DropdownMenuContentProps) => (
    <Content {...props} className={cn('DropdownMenuContent', className)} />
  ),
  Item: ({ className, ...props }: DropdownMenuItemProps) => (
    <Item {...props} className={cn('DropdownMenuItem ox-menu-item', className)} />
  ),
}
