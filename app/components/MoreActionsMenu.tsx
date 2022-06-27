import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'

import type { MenuAction } from '@oxide/table'
import { More12Icon } from '@oxide/ui'

interface MoreActionsMenuProps {
  /** The accessible name for the menu button */
  label: string
  actions: MenuAction[]
}
export const MoreActionsMenu = ({ actions, label }: MoreActionsMenuProps) => {
  return (
    <Menu>
      <MenuButton
        aria-label={label}
        className="w-6 h-6 border border-default flex rounded items-center justify-center hover:bg-hover"
      >
        <More12Icon className="text-tertiary" />
      </MenuButton>
      <MenuList className="mt-2">
        {actions.map((a) => (
          <MenuItem disabled={a.disabled} key={a.label} onSelect={a.onActivate}>
            {a.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}
