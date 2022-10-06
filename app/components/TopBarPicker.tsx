import { Menu, MenuButton, MenuItem, MenuLink, MenuList } from '@reach/menu-button'
import cn from 'classnames'
import { Link, useParams } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { Identicon, Organization16Icon, SelectArrows6Icon, Success12Icon } from '@oxide/ui'

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
  current: string | null | undefined
  items: TopBarPickerItem[]
  noItemsText?: string
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
        {props.current ? (
          <div className="text-left">
            <div className="text-mono-xs text-quaternary">{props.category}</div>
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sans-md text-secondary">
              {props.display ?? props.current}
            </div>
          </div>
        ) : (
          <div className="text-left">
            <div className="text-mono-sm text-secondary">
              Select
              <br />
              {props.category}
            </div>
          </div>
        )}
      </div>
      {/* aria-hidden is a tip from the Reach docs */}
      <div className="ml-4 flex h-[2rem] w-[1.125rem] flex-shrink-0 items-center justify-center rounded border border-default group-hover:bg-hover">
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
              <span className="flex w-full items-center justify-between">
                {label} {isSelected && <Success12Icon className="-mr-3 block" />}
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
          {props.noItemsText || 'No items found'}
        </MenuItem>
      )}
    </MenuList>
  </Menu>
)

/**
 * Uses the @oxide/identicon library to generate an identicon based on a hash of the org name
 * Will eventually need to support user uploaded org avatars and fallback to this if there isn't one
 */
const OrgLogo = ({ name }: { name: string }) => (
  <Identicon
    className="flex h-[34px] w-[34px] items-center justify-center rounded text-accent bg-accent-secondary-hover"
    name={name}
  />
)

const NoOrgLogo = () => (
  <div className="flex h-[34px] w-[34px] items-center justify-center rounded text-secondary bg-secondary">
    <Organization16Icon />
  </div>
)

export function SiloSystemPicker({ isSystem }: { isSystem: boolean }) {
  const commonProps = {
    items: [
      { label: 'System', to: pb.silos() },
      { label: 'Silo', to: pb.orgs() },
    ],
    'aria-label': 'Switch between system and silo',
  }

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
  const { orgName } = useParams()
  const { data } = useApiQuery('organizationList', { limit: 20 })
  const items = (data?.items || []).map((org) => ({
    label: org.name,
    to: pb.projects({ orgName: org.name }),
  }))

  return (
    <TopBarPicker
      aria-label="Switch organization"
      icon={orgName ? <OrgLogo name={orgName} /> : <NoOrgLogo />}
      category="Organization"
      current={orgName}
      items={items}
      noItemsText="No organizations found"
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
      noItemsText="No projects found"
    />
  )
}
