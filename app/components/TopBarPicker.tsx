import { Menu, MenuButton, MenuItem, MenuLink, MenuList } from '@reach/menu-button'
import cn from 'classnames'
import { Link, useParams } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { Identicon, Organization16Icon, SelectArrows6Icon, Success12Icon } from '@oxide/ui'

import { useInstanceSelector, useProjectSelector, useSiloParams } from 'app/hooks'
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
  items?: TopBarPickerItem[]
  noItemsText?: string
  icon?: React.ReactElement
}

const TopBarPicker = (props: TopBarPickerProps) => {
  const { orgName, projectName, instanceName } = useParams()
  let crumbUrl
  if (props.category === 'Instance') {
    crumbUrl = `/orgs/${orgName}/projects/${projectName}/instances/${instanceName}`
  } else if (props.category === 'Project') {
    crumbUrl = `/orgs/${orgName}/projects/${projectName}`
  } else if (props.category === 'Organization') {
    crumbUrl = `/orgs/${orgName}`
  }

  return (
    <Menu>
      <div
        // Important trick: we never want the separator to show up after the top
        // left corner picker. The separator starts from the leftmost of "other
        // pickers". But the leftmost corner one is in its own container and
        // therefore always last-of-type, so it will never get one.
        className="after:text-mono-lg flex w-full items-center justify-between after:mx-4 after:content-['/'] after:text-quinary last-of-type:after:content-none"
      >
        <Link to={crumbUrl || ''}>
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
                <div className="text-mono-xs text-quaternary">
                  Select
                  <br />
                  {props.category}
                </div>
              </div>
            )}
          </div>
        </Link>
        {/* aria-hidden is a tip from the Reach docs */}
        {props.items && (
          <div className="ml-4">
            <MenuButton className="group" aria-label={props['aria-label']}>
              <div className="flex h-[2rem] w-[1.125rem] flex-shrink-0 items-center justify-center rounded border border-default group-hover:bg-hover">
                <SelectArrows6Icon className="text-secondary" aria-hidden />
              </div>
            </MenuButton>
          </div>
        )}
      </div>
      {/* TODO: item size and focus highlight */}
      {/* TODO: popover position should be further right */}
      {props.items && (
        <MenuList className="mt-2 min-w-[12.8125rem]">
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
      )}
    </Menu>
  )
}

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

/**
 * Return `null` instead of the picker when the user doesn't have fleet viewer
 * perms so it can get filtered out of the children array in `<TopBar>`. Having
 * `<SiloSystemPicker>` itself return `null` from render doesn't work because
 * `<TopBar>` can't see that.
 */
export function useSiloSystemPicker(value: 'silo' | 'system') {
  // User is only shown system routes if they have viewer perms (at least) on
  // the fleet. The natural place to find out whether they have such perms is
  // the fleet policy, but if the user doesn't have fleet read, we'll get a 403
  // from that endpoint. So we simply check whether that endpoint 200s or not to
  // determine whether the user is a fleet viewer.
  //
  // Note that we are able to ignore the possibility of `systemPolicy` being
  // undefined due to the request being in flight because we have prefetched
  // this request in the loader. If that prefetch were removed, fleet viewers
  // would see the silo picker pop in when the request resolves, which would be
  // bad.
  const { data: systemPolicy } = useApiQuery('systemPolicyViewV1', {})
  return systemPolicy ? <SiloSystemPicker value={value} /> : null
}

/** Choose between System and Silo-scoped route trees */
export function SiloSystemPicker({ value }: { value: 'silo' | 'system' }) {
  const commonProps = {
    items: [
      { label: 'System', to: pb.silos() },
      { label: 'Silo', to: pb.orgs() },
    ],
    'aria-label': 'Switch between system and silo',
  }

  return value === 'system' ? (
    <TopBarPicker
      {...commonProps}
      category="System"
      current="System"
      display="Oxide Computer Co."
    />
  ) : (
    // TODO: actual silo name
    // TODO: when silo name is too long, it overflows sidebar
    <TopBarPicker {...commonProps} category="Silo" current="Silo" display="corp.dev" />
  )
}

/** Used when drilling down into a silo from the System view. */
export function SiloPicker() {
  // picker only shows up when a silo is in scope
  const { siloName } = useSiloParams()
  const { data } = useApiQuery('siloList', { query: { limit: 10 } })
  const items = (data?.items || []).map((silo) => ({
    label: silo.name,
    to: pb.silo({ silo: silo.name }),
  }))

  return (
    <TopBarPicker
      aria-label="Switch silo"
      category="Silo"
      icon={<OrgLogo name={siloName} />}
      current={siloName}
      items={items}
      noItemsText="No silos found"
    />
  )
}

export function OrgPicker() {
  const { orgName } = useParams()
  const { data } = useApiQuery('organizationListV1', { query: { limit: 20 } })
  const items = (data?.items || []).map(({ name }) => ({
    label: name,
    to: pb.projects({ organization: name }),
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
  // picker only shows up when a project is in scope
  const { organization, project } = useProjectSelector()
  const { data } = useApiQuery('projectListV1', {
    query: { organization, limit: 20 },
  })
  const items = (data?.items || []).map(({ name }) => ({
    label: name,
    to: pb.instances({ organization, project: name }),
  }))

  return (
    <TopBarPicker
      aria-label="Switch project"
      category="Project"
      current={project}
      items={items}
      noItemsText="No projects found"
    />
  )
}

export function InstancePicker() {
  // picker only shows up when an instance is in scope
  const { instance } = useInstanceSelector()

  return (
    <TopBarPicker
      aria-label="Switch instance"
      category="Instance"
      current={instance}
      noItemsText="No instances found"
    />
  )
}
