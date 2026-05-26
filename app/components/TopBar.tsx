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
  MenuClose12Icon,
  MenuOpen12Icon,
  Monitor12Icon,
  Moon12Icon,
  Profile16Icon,
  SelectArrows6Icon,
  Servers16Icon,
  Success12Icon,
  Sun12Icon,
} from '@oxide/design-system/icons/react'

import { useCrumbs } from '~/hooks/use-crumbs'
import { useCurrentUser } from '~/hooks/use-current-user'
import { toggleSidebar, useMenuState } from '~/hooks/use-menu-state'
import { topBarWrapperClass } from '~/layouts/helpers'
import { useThemeStore, type Theme } from '~/stores/theme'
import { buttonStyle } from '~/ui/lib/Button'
import * as DropdownMenu from '~/ui/lib/DropdownMenu'
import { Identicon } from '~/ui/lib/Identicon'
import { Slash } from '~/ui/lib/Slash'
import { intersperse } from '~/util/array'
import { pb } from '~/util/path-builder'

export function TopBar({ systemOrSilo }: { systemOrSilo: 'system' | 'silo' }) {
  return (
    <div className={cn(topBarWrapperClass, 'max-1000:flex')}>
      <MobileMenuButton />
      <div className="border-secondary flex items-center border-r p-1">
        <HomeButton level={systemOrSilo} />
      </div>
      <div className="flex items-center justify-between gap-4 px-3">
        <div className="flex flex-1 gap-2.5 overflow-hidden">
          <Breadcrumbs />
        </div>
        <div className="flex items-center gap-2">
          {/* Hidden on mobile — sign out and settings are in the sidebar drawer */}
          <UserMenu className="max-1000:hidden" />
        </div>
      </div>
    </div>
  )
}

function MobileMenuButton({ className }: { className?: string }) {
  const { isOpen } = useMenuState()
  return (
    <button
      type="button"
      className={cn('flex items-center justify-center pl-3 group 1000:hidden', className)}
      onClick={toggleSidebar}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <div className="border-default group-hover:600:bg-hover flex size-8.5 items-center justify-center rounded-md border">
        {isOpen ? (
          <MenuClose12Icon className="text-default" />
        ) : (
          <MenuOpen12Icon className="text-default" />
        )}
      </div>
    </button>
  )
}

const bigIconBox = 'flex aspect-square h-8.5 items-center justify-center rounded-md'

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

  const inner = (
    <div className="flex w-full items-center">
      <div className="mr-2">{config.icon}</div>
      <div className="1000:block hidden min-w-0 flex-1 text-left">
        <div className="text-mono-xs text-tertiary">{config.heading}</div>
        <div className="text-sans-md text-raise overflow-hidden text-ellipsis whitespace-nowrap">
          {config.label}
        </div>
      </div>
      {me.fleetViewer && (
        <SelectArrows6Icon
          className="text-quaternary 1000:ml-2 w-1.5! shrink-0"
          aria-hidden
        />
      )}
    </div>
  )

  // Non-fleet viewers only have access to their silo, so no switcher
  if (!me.fleetViewer) {
    return (
      <Link to={config.to} className="hover:bg-hover w-full grow rounded-lg p-1">
        {inner}
      </Link>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label="Switch between system and silo"
        className="hover:bg-hover w-full grow rounded-lg p-1"
      >
        {inner}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="z-(--z-top-bar) mt-2" anchor="bottom start">
        <SystemSiloItem to={pb.silos()} label="System" isSelected={level === 'system'} />
        <SystemSiloItem to={pb.projects()} label="Silo" isSelected={level === 'silo'} />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
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

function UserMenu({ className }: { className?: string }) {
  const logout = useApiMutation(api.logout, {
    onSuccess: () => navToLogin({ includeCurrent: false }),
  })
  // fetch happens in loader wrapping all authed pages
  const { me } = useCurrentUser()
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger aria-label="User menu" className={cn('rounded-md', className)}>
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
      <DropdownMenu.Content gap={8} zIndex="topBar">
        <DropdownMenu.LinkItem to={pb.profile()}>Settings</DropdownMenu.LinkItem>
        <ThemeSubmenu />
        <DropdownMenu.Item onSelect={() => logout.mutate({})} label="Sign out" />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

function ThemeSubmenu() {
  const { theme, setTheme } = useThemeStore()
  return (
    <DropdownMenu.Submenu>
      <DropdownMenu.SubmenuTrigger className="DropdownMenuItem ox-menu-item border-secondary border-b">
        Theme
      </DropdownMenu.SubmenuTrigger>
      <DropdownMenu.SubContent>
        <DropdownMenu.RadioGroup value={theme} onValueChange={setTheme}>
          <ThemeRadioItem
            value="light"
            icon={<Sun12Icon />}
            label="Light"
            selected={theme === 'light'}
          />
          <ThemeRadioItem
            value="dark"
            icon={<Moon12Icon />}
            label="Dark"
            selected={theme === 'dark'}
          />
          <ThemeRadioItem
            value="system"
            icon={<Monitor12Icon />}
            label="System"
            selected={theme === 'system'}
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
  value: Theme
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
