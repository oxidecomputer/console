/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { Link } from 'react-router'

import { api, navToLogin, useApiMutation } from '@oxide/api'
import {
  DirectionRightIcon,
  Monitor12Icon,
  Moon12Icon,
  Organization16Icon,
  Profile16Icon,
  SelectArrows6Icon,
  Servers16Icon,
  Success12Icon,
  Sun12Icon,
} from '@oxide/design-system/icons/react'

import { useCrumbs } from '~/hooks/use-crumbs'
import { useCurrentUser } from '~/hooks/use-current-user'
import { setThemePreference, useThemeStore, type ThemePreference } from '~/stores/theme'
import { buttonStyle } from '~/ui/lib/Button'
import * as DropdownMenu from '~/ui/lib/DropdownMenu'
import { Identicon } from '~/ui/lib/Identicon'
import { Slash } from '~/ui/lib/Slash'
import { intersperse } from '~/util/array'
import { pb } from '~/util/path-builder'

export function TopBar({ systemOrSilo }: { systemOrSilo: 'system' | 'silo' }) {
  const { me } = useCurrentUser()
  // The height of this component is governed by the `PageContainer`
  // It's important that this component returns two distinct elements (wrapped in a fragment).
  // Each element will occupy one of the top column slots provided by `PageContainer`.
  return (
    <>
      <div className="border-secondary flex items-center border-r border-b px-2">
        <HomeButton level={systemOrSilo} />
      </div>
      {/* Height is governed by PageContainer grid */}
      <div className="bg-default border-secondary flex items-center justify-between gap-4 border-b px-3">
        <div className="flex flex-1 gap-2.5">
          <Breadcrumbs />
        </div>
        <div className="flex items-center gap-2">
          {me.fleetViewer && <SiloSystemPicker level={systemOrSilo} />}
          <UserMenu />
        </div>
      </div>
    </>
  )
}

const bigIconBox = 'flex h-[34px] w-[34px] items-center justify-center rounded-md'

const BigIdenticon = ({ name }: { name: string }) => (
  <Identicon className={cn(bigIconBox, 'text-accent bg-accent-hover')} name={name} />
)

const SystemIcon = () => (
  <div className={cn(bigIconBox, 'text-quaternary bg-tertiary')}>
    <Servers16Icon />
  </div>
)

function HomeButton({ level }: { level: 'system' | 'silo' }) {
  const { me } = useCurrentUser()

  const config =
    level === 'silo'
      ? {
          to: pb.projects(),
          icon: <BigIdenticon name={me.siloName} />,
          heading: 'Silo',
          label: me.siloName,
        }
      : {
          to: pb.silos(),
          icon: <SystemIcon />,
          heading: 'Oxide',
          label: 'System',
        }

  return (
    <Link to={config.to} className="hover:bg-hover w-full grow rounded-lg p-1">
      <div className="flex w-full items-center">
        <div className="mr-2">{config.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="text-mono-xs text-tertiary">{config.heading}</div>
          <div className="text-sans-md text-raise overflow-hidden text-ellipsis whitespace-nowrap">
            {config.label}
          </div>
        </div>
      </div>
    </Link>
  )
}

function Breadcrumbs() {
  const crumbs = useCrumbs().filter((c) => !c.titleOnly)
  return (
    <nav
      className="text-sans-md flex items-center gap-0.5 overflow-clip"
      aria-label="Breadcrumbs"
    >
      {intersperse(
        crumbs.map(({ label, path }, i) => (
          <Link
            to={path}
            className={cn(
              'text-sans-md whitespace-nowrap',
              i === crumbs.length - 1 ? 'text-raise' : 'text-secondary hover:text-default'
            )}
            key={`${label}|${path}`}
          >
            {label}
          </Link>
        )),
        <Slash />
      )}
    </nav>
  )
}

function UserMenu() {
  const logout = useApiMutation(api.logout, {
    onSuccess: () => navToLogin({ includeCurrent: false }),
  })
  // fetch happens in loader wrapping all authed pages
  const { me } = useCurrentUser()
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger aria-label="User menu" className="rounded-md">
        <div
          className={cn(
            buttonStyle({ size: 'sm', variant: 'ghost' }),
            'flex items-center gap-1.5 px-2!'
          )}
        >
          <Profile16Icon className="text-tertiary" />
          <span className="text-sans-md text-default normal-case">
            {me.displayName || 'User'}
          </span>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content gap={8}>
        <DropdownMenu.LinkItem to={pb.profile()}>Settings</DropdownMenu.LinkItem>
        <ThemeSubmenu />
        <DropdownMenu.Item onSelect={() => logout.mutate({})} label="Sign out" />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

function ThemeSubmenu() {
  const { preference } = useThemeStore()
  return (
    <DropdownMenu.Submenu>
      <DropdownMenu.SubmenuTrigger className="DropdownMenuItem ox-menu-item border-secondary border-b">
        <span className="flex w-full items-center justify-between">
          Theme
          <DirectionRightIcon className="text-quaternary absolute right-3" aria-hidden />
        </span>
      </DropdownMenu.SubmenuTrigger>
      <DropdownMenu.SubContent>
        <DropdownMenu.RadioGroup
          value={preference}
          onValueChange={(v) => setThemePreference(v as ThemePreference)}
        >
          <ThemeRadioItem
            value="light"
            icon={<Sun12Icon />}
            label="Light"
            selected={preference === 'light'}
          />
          <ThemeRadioItem
            value="dark"
            icon={<Moon12Icon />}
            label="Dark"
            selected={preference === 'dark'}
          />
          <ThemeRadioItem
            value="system"
            icon={<Monitor12Icon />}
            label="System"
            selected={preference === 'system'}
          />
        </DropdownMenu.RadioGroup>
      </DropdownMenu.SubContent>
    </DropdownMenu.Submenu>
  )
}

function ThemeRadioItem({
  value,
  icon,
  label,
  selected,
}: {
  value: ThemePreference
  icon: React.ReactNode
  label: string
  selected: boolean
}) {
  return (
    <DropdownMenu.RadioItem
      value={value}
      className={cn('DropdownMenuItem ox-menu-item', selected && 'is-selected')}
    >
      <span className="flex w-full items-center gap-2">
        <span className="text-quaternary">{icon}</span>
        <span>{label}</span>
        {selected && <Success12Icon className="absolute right-3" />}
      </span>
    </DropdownMenu.RadioItem>
  )
}

/**
 * Choose between System and Silo-scoped route trees, or if the user doesn't
 * have access to system routes (i.e., if /v1/me has fleetViewer: false) show
 * the current silo.
 */
function SiloSystemPicker({ level }: { level: 'silo' | 'system' }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger aria-label="Switch between system and silo">
        <div
          className={cn(
            buttonStyle({ size: 'sm', variant: 'ghost' }),
            'flex items-center gap-1.5 px-2!'
          )}
        >
          <div className="text-tertiary flex items-center">
            {level === 'system' ? <Servers16Icon /> : <Organization16Icon />}
          </div>
          <span className="text-sans-md text-default normal-case">
            {level === 'system' ? 'System' : 'Silo'}
          </span>
          {/* aria-hidden is a tip from the Reach docs */}
          <SelectArrows6Icon className="text-quaternary ml-3 w-1.5!" aria-hidden />
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="mt-2" anchor="bottom start">
        <SystemSiloItem to={pb.silos()} label="System" isSelected={level === 'system'} />
        <SystemSiloItem to={pb.projects()} label="Silo" isSelected={level === 'silo'} />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

function SystemSiloItem(props: { label: string; to: string; isSelected: boolean }) {
  return (
    <DropdownMenu.LinkItem
      to={props.to}
      className={cn('pr-3!', { 'is-selected': props.isSelected })}
    >
      <div className="flex w-full items-center gap-2">
        <div className="grow">{props.label}</div>
        {props.isSelected && <Success12Icon className="block" />}
      </div>
    </DropdownMenu.LinkItem>
  )
}
