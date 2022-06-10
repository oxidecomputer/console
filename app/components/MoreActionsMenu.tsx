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
      <MenuButton aria-label={label}>
        <More12Icon className="text-tertiary" />
      </MenuButton>
      <MenuList>
        {actions.map((a) => (
          <MenuItem disabled={a.disabled} key={a.label} onSelect={a.onActivate}>
            {a.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}
