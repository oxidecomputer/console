import { Menu, MenuButton, MenuItem, MenuLink, MenuList } from '@reach/menu-button'
import { Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { SelectArrows6Icon } from '@oxide/ui'

import { useRequiredParams } from 'app/hooks'

type TopBarPickerItem = {
  label: string
  to: string
}

type TopBarPickerProps = {
  category: string
  current: string
  items: TopBarPickerItem[]
  fallbackText: string
  icon?: React.ReactElement
}

function TopBarPicker({ category, current, items, icon, fallbackText }: TopBarPickerProps) {
  return (
    <Menu>
      <MenuButton
        aria-label="Switch project"
        className="flex items-center justify-between w-full group"
      >
        <div className="flex items-center">
          {icon ? <div className="mr-2 flex items-center">{icon}</div> : null}
          <div className="text-left">
            <div className="text-mono-sm text-secondary">{category}</div>
            <div className="text-ellipsis whitespace-nowrap overflow-hidden text-sans-md">
              {current}
            </div>
          </div>
        </div>
        {/* aria-hidden is a tip from the Reach docs */}
        <div className="flex flex-shrink-0 w-[1.125rem] h-[1.625rem] ml-4 rounded border border-secondary justify-center items-center group-hover:bg-hover">
          <SelectArrows6Icon className="text-secondary" aria-hidden />
        </div>
      </MenuButton>
      {/* TODO: fix z-index on popover, it's behind the TopBar background */}
      {/* TODO: item size and focus highlight */}
      {/* TODO: popover position should be further right */}
      <MenuList className="mt-2">
        {items.length > 0 ? (
          items.map(({ label, to }) => (
            <MenuLink key={label} as={Link} to={to}>
              {label}
            </MenuLink>
          ))
        ) : (
          <MenuItem
            className="!text-center hover:cursor-default !pr-3 !text-secondary"
            onSelect={() => {}}
            disabled
          >
            {fallbackText}
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  )
}

/**
 * This is temporary until we figure out the proper thing to go here
 */
const MazeWarLogo = () => (
  <svg width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="2" fill="var(--base-grey-800)" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 4H4V10V28H10V10H22V28H28V4H24H22H10ZM13 13H19V28H13V13Z"
      fill="var(--base-black-700)"
    />
  </svg>
)

// TODO: maybe don't filter out the currently selected one

export function OrgPicker() {
  const { orgName } = useRequiredParams('orgName')
  const { data } = useApiQuery('organizationList', { limit: 20 })
  const items = (data?.items || [])
    .filter((p) => p.name !== orgName)
    .map((org) => ({ label: org.name, to: `/orgs/${org.name}/projects` }))

  return (
    <TopBarPicker
      icon={<MazeWarLogo />}
      category="Organization"
      current={orgName}
      items={items}
      fallbackText="No other organizations found"
    />
  )
}

export function ProjectPicker() {
  const { orgName, projectName } = useRequiredParams('orgName', 'projectName')
  const { data } = useApiQuery('projectList', { orgName, limit: 20 })
  const items = (data?.items || [])
    .filter((p) => p.name !== projectName)
    .map((p) => ({ label: p.name, to: `/orgs/${orgName}/projects/${p.name}/instances` }))

  return (
    <TopBarPicker
      category="Project"
      current={projectName}
      items={items}
      fallbackText="No other projects found"
    />
  )
}
