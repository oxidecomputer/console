import { Menu, MenuButton, MenuItem, MenuLink, MenuList } from '@reach/menu-button'
import { Link, useLocation } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { SelectArrows6Icon } from '@oxide/ui'

import { useRequiredParams } from 'app/hooks'

type TopBarPickerItem = {
  label: string
  to: string
}

type TopBarPickerProps = {
  'aria-label': string
  category: string
  current: string
  items: TopBarPickerItem[]
  fallbackText?: string
  icon?: React.ReactElement
}

const TopBarPicker = (props: TopBarPickerProps) => (
  <Menu>
    <MenuButton
      aria-label={props['aria-label']}
      className="group flex w-full items-center justify-between"
    >
      <div className="flex items-center">
        {props.icon ? <div className="mr-2 flex items-center">{props.icon}</div> : null}
        <div className="text-left">
          <div className="text-mono-sm text-secondary">{props.category}</div>
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sans-md">
            {props.current}
          </div>
        </div>
      </div>
      {/* aria-hidden is a tip from the Reach docs */}
      <div className="ml-4 flex h-[1.625rem] w-[1.125rem] flex-shrink-0 items-center justify-center rounded border border-secondary group-hover:bg-hover">
        <SelectArrows6Icon className="text-secondary" aria-hidden />
      </div>
    </MenuButton>
    {/* TODO: item size and focus highlight */}
    {/* TODO: popover position should be further right */}
    <MenuList className="mt-2">
      {props.items.length > 0 ? (
        props.items.map(({ label, to }) => (
          <MenuLink key={label} as={Link} to={to}>
            {label}
          </MenuLink>
        ))
      ) : (
        <MenuItem
          className="!pr-3 !text-center !text-secondary hover:cursor-default"
          onSelect={() => {}}
          disabled
        >
          {props.fallbackText || 'No items found'}
        </MenuItem>
      )}
    </MenuList>
  </Menu>
)

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

export function SiloSystemPicker() {
  const commonProps = {
    items: [
      { label: 'System', to: '/system' },
      { label: 'Silo', to: '/orgs' },
    ],
    'aria-label': 'Switch between system and silo',
  }

  const isSystem = useLocation().pathname.startsWith('/system') // lol

  return isSystem ? (
    <TopBarPicker {...commonProps} category="System" current="Happy Customer, Inc." />
  ) : (
    // TODO: actual silo name
    // TODO: when silo name is too long, it overflows sidebar
    <TopBarPicker {...commonProps} category="Silo" current="corp.dev" />
  )
}

// TODO: maybe don't filter out the currently selected one

export function OrgPicker() {
  const { orgName } = useRequiredParams('orgName')
  const { data } = useApiQuery('organizationList', { limit: 20 })
  const items = (data?.items || [])
    .filter((p) => p.name !== orgName)
    .map((org) => ({ label: org.name, to: `/orgs/${org.name}/projects` }))

  return (
    <TopBarPicker
      aria-label="Switch organization"
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
      aria-label="Switch project"
      category="Project"
      current={projectName}
      items={items}
      fallbackText="No other projects found"
    />
  )
}
