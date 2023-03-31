import cn from 'classnames'
import { Link, useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { useApiQuery } from '@oxide/api'
import {
  DropdownMenu,
  Folder16Icon,
  Identicon,
  SelectArrows6Icon,
  Success12Icon,
  Truncate,
  Wrap,
} from '@oxide/ui'

import { useInstanceSelector, useSiloSelector } from 'app/hooks'
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
  to?: string
}

const TopBarPicker = (props: TopBarPickerProps) => {
  return (
    <DropdownMenu.Root>
      <div
        // Important trick: we never want the separator to show up after the top
        // left corner picker. The separator starts from the leftmost of "other
        // pickers". But the leftmost corner one is in its own container and
        // therefore always last-of-type, so it will never get one.
        className="after:text-mono-lg flex w-full items-center justify-between after:mx-4 after:content-['/'] after:text-quinary last-of-type:after:content-none"
      >
        <Wrap when={props.to} with={<Link to={props.to!} />}>
          <div className="flex items-center">
            {props.icon ? <div className="mr-2 flex items-center">{props.icon}</div> : null}
            {props.current ? (
              <div className="text-left">
                <div className="text-mono-xs text-quaternary">{props.category}</div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sans-md text-secondary">
                  <Truncate text={props.display ?? props.current} maxLength={24} />
                </div>
              </div>
            ) : (
              <div className="text-left">
                <div className="min-w-[5rem] text-mono-xs text-quaternary">
                  Select
                  <br />
                  {props.category}
                </div>
              </div>
            )}
          </div>
        </Wrap>
        {/* aria-hidden is a tip from the Reach docs */}
        {props.items && (
          <div className="ml-4">
            <DropdownMenu.Trigger className="group" aria-label={props['aria-label']}>
              <div className="flex h-[2rem] w-[1.125rem] flex-shrink-0 items-center justify-center rounded border border-default group-hover:bg-hover">
                <SelectArrows6Icon className="text-secondary" aria-hidden />
              </div>
            </DropdownMenu.Trigger>
          </div>
        )}
      </div>
      {/* TODO: item size and focus highlight */}
      {/* TODO: popover position should be further right */}
      {props.items && (
        // portal is necessary to avoid the menu popover getting its own after:
        // separator thing
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="mt-2 min-w-[12.8125rem]" align="start">
            {props.items.length > 0 ? (
              props.items.map(({ label, to }) => {
                const isSelected = props.current === label
                return (
                  <DropdownMenu.Item asChild key={label}>
                    <Link to={to} className={cn({ 'is-selected': isSelected })}>
                      <span className="flex w-full items-center justify-between">
                        <Truncate text={label} maxLength={24} />
                        {isSelected && <Success12Icon className="-mr-3 block" />}
                      </span>
                    </Link>
                  </DropdownMenu.Item>
                )
              })
            ) : (
              <DropdownMenu.Item
                className="!pr-3 !text-center !text-secondary hover:cursor-default"
                onSelect={() => {}}
                disabled
              >
                {props.noItemsText || 'No items found'}
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      )}
    </DropdownMenu.Root>
  )
}

/**
 * Uses the @oxide/identicon library to generate an identicon based on a hash of the org name
 * Will eventually need to support user uploaded org avatars and fallback to this if there isn't one
 */
const BigIdenticon = ({ name }: { name: string }) => (
  <Identicon
    className="flex h-[34px] w-[34px] items-center justify-center rounded text-accent bg-accent-secondary-hover"
    name={name}
  />
)

/**
 * Choose between System and Silo-scoped route trees, or if the user doesn't
 * have access to system routes (i.e., if systemPolicyView 403s) show the
 * current silo.
 */
export function SiloSystemPicker({ value }: { value: 'silo' | 'system' }) {
  const { data: me } = useApiQuery('currentUserView', {})
  invariant(me, 'Current user should be prefetched')

  // User can only get to system routes if they have viewer perms (at least) on
  // the fleet. The natural place to find out whether they have such perms is
  // the fleet (system) policy, but if the user doesn't have fleet read, we'll
  // get a 403 from that endpoint. So we simply check whether that endpoint 200s
  // or not to determine whether the user is a fleet viewer.
  const { isLoading, isSuccess: canSeeSystemPolicy } = useApiQuery('systemPolicyView', {})
  invariant(!isLoading, 'systemPolicyView should be prefetched in a loader')

  // if the user can't see the picker, show a placeholder control with their
  // silo name that links to root/home
  if (!canSeeSystemPolicy) {
    return (
      <TopBarPicker
        aria-label={`${me.siloName} - Oxide Web Console`}
        icon={<BigIdenticon name={me.siloName} />}
        category="Silo"
        current="Silo"
        display={me.siloName}
        to={pb.projects()}
      />
    )
  }

  const commonProps = {
    items: [
      { label: 'System', to: pb.silos() },
      { label: 'Silo', to: pb.projects() },
    ],
    'aria-label': 'Switch between system and silo',
  }

  return value === 'system' ? (
    <TopBarPicker
      {...commonProps}
      category="System"
      current="System"
      display="Oxide Computer Co." // TODO: company name
      to={pb.silos()}
    />
  ) : (
    <TopBarPicker
      {...commonProps}
      icon={<BigIdenticon name={me.siloName} />}
      category="Silo"
      current="Silo"
      display={me.siloName}
      to={pb.projects()}
    />
  )
}

/** Used when drilling down into a silo from the System view. */
export function SiloPicker() {
  // picker only shows up when a silo is in scope
  const { silo: siloName } = useSiloSelector()
  const { data } = useApiQuery('siloList', { query: { limit: 10 } })
  const items = (data?.items || []).map((silo) => ({
    label: silo.name,
    to: pb.silo({ silo: silo.name }),
  }))

  return (
    <TopBarPicker
      aria-label="Switch silo"
      category="Silo"
      icon={<BigIdenticon name={siloName} />}
      current={siloName}
      items={items}
      noItemsText="No silos found"
    />
  )
}

const NoProjectLogo = () => (
  <div className="flex h-[34px] w-[34px] items-center justify-center rounded text-secondary bg-secondary">
    <Folder16Icon />
  </div>
)

export function ProjectPicker() {
  // picker only shows up when a project is in scope
  const { project } = useParams()
  const { data } = useApiQuery('projectList', { query: { limit: 20 } })
  const items = (data?.items || []).map(({ name }) => ({
    label: name,
    to: pb.instances({ project: name }),
  }))

  return (
    <TopBarPicker
      aria-label="Switch project"
      icon={project ? undefined : <NoProjectLogo />}
      category="Project"
      current={project}
      to={project ? pb.project({ project }) : undefined}
      items={items}
      noItemsText="No projects found"
    />
  )
}

export function InstancePicker() {
  // picker only shows up when an instance is in scope
  const instanceSelector = useInstanceSelector()
  const { instance } = instanceSelector

  return (
    <TopBarPicker
      aria-label="Switch instance"
      category="Instance"
      current={instance}
      to={pb.instanceStorage(instanceSelector)}
      noItemsText="No instances found"
    />
  )
}
