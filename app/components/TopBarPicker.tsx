import { Menu, MenuButton, MenuItem, MenuLink, MenuList } from '@reach/menu-button'
import cn from 'classnames'
import { Link, useLocation } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { generateIdenticon, md5 } from '@oxide/identicon'
import { SelectArrows6Icon, Success12Icon } from '@oxide/ui'

import { useRequiredParams } from 'app/hooks'
import { pb } from 'app/util/path-builder'

type TopBarPickerItem = {
  label: string
  to: string
}

type TopBarPickerProps = {
  'aria-label': string
  category: string
  /** Text displayed below the category. Defaults to `current` if not provided. */
  display?: string
  /** The actively selected option. Used as display if display isn't present. */
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
            {props.display ?? props.current}
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
    <MenuList className="ox-menu-list">
      {props.items.length > 0 ? (
        props.items.map(({ label, to }) => {
          const isSelected = props.current === label
          return (
            <MenuLink
              key={label}
              as={Link}
              to={to}
              className={cn('ox-menu-item', { 'is-selected': isSelected })}
            >
              <span className="flex items-center justify-between">
                {label} {isSelected && <Success12Icon />}
              </span>
            </MenuLink>
          )
        })
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
 * Uses the @oxide/identicon library to generate an identicon based on a hash of the org name
 * Will eventually need to support user uploaded org avatars and fallback to this if there isn't one
 */
const OrgLogo = (name: string) => (
  <div
    className="flex h-[34px] w-[34px] items-center justify-center rounded bg-green-900 text-green-500"
    dangerouslySetInnerHTML={{ __html: generateIdenticon(md5(name)) }}
  />
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
    <TopBarPicker
      {...commonProps}
      category="System"
      current="System"
      display="Happy Customer, Inc."
    />
  ) : (
    // TODO: actual silo name
    // TODO: when silo name is too long, it overflows sidebar
    <TopBarPicker {...commonProps} category="Silo" current="Silo" display="corp.dev" />
  )
}

// TODO: maybe don't filter out the currently selected one

export function OrgPicker() {
  const { orgName } = useRequiredParams('orgName')
  const { data } = useApiQuery('organizationList', { limit: 20 })
  const items = (data?.items || []).map((org) => ({
    label: org.name,
    to: pb.projects({ orgName: org.name }),
  }))

  return (
    <TopBarPicker
      aria-label="Switch organization"
      icon={OrgLogo(orgName)}
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
  const items = (data?.items || []).map((p) => ({
    label: p.name,
    to: pb.instances({ orgName, projectName: p.name }),
  }))

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
