/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { Link } from 'react-router-dom'

import { navToLogin, useApiMutation } from '@oxide/api'
import { Profile16Icon, Servers16Icon } from '@oxide/design-system/icons/react'

import { SiloSystemPicker } from '~/components/SystemSiloPicker'
import { useCrumbs } from '~/hooks/use-crumbs'
import { useCurrentUser } from '~/layouts/AuthenticatedLayout'
import { buttonStyle } from '~/ui/lib/Button'
import * as DropdownMenu from '~/ui/lib/DropdownMenu'
import { Identicon } from '~/ui/lib/Identicon'
import { Slash } from '~/ui/lib/Slash'
import { intersperse } from '~/util/array'
import { pb } from '~/util/path-builder'

export function TopBar({ level }: { level: 'system' | 'silo' }) {
  // The height of this component is governed by the `PageContainer`
  // It's important that this component returns two distinct elements (wrapped in a fragment).
  // Each element will occupy one of the top column slots provided by `PageContainer`.
  return (
    <>
      <div className="flex items-center border-b border-r px-2 border-secondary">
        <HomeButton level={level} />
      </div>
      {/* Height is governed by PageContainer grid */}
      <div className="flex items-center justify-between gap-4 border-b px-3 bg-default border-secondary">
        <div className="flex flex-1 gap-2.5">
          <Breadcrumbs />
        </div>
        <div className="flex items-center gap-2">
          <SiloSystemPicker level={level} />
          <UserMenu />
        </div>
      </div>
    </>
  )
}

const bigIconBox = 'flex h-[34px] w-[34px] items-center justify-center rounded'

const BigIdenticon = ({ name }: { name: string }) => (
  <Identicon
    className={cn(bigIconBox, 'text-accent bg-accent-secondary-hover')}
    name={name}
  />
)

const SystemIcon = () => (
  <div className={cn(bigIconBox, 'text-quinary bg-tertiary')}>
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
    <Link to={config.to} className="w-full grow rounded-lg p-1 hover:bg-hover">
      <div className="flex w-full items-center">
        <div className="mr-2">{config.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="text-mono-xs text-quaternary">{config.heading}</div>
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sans-md text-secondary">
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
      className="flex items-center gap-0.5 overflow-clip text-sans-md"
      aria-label="Breadcrumbs"
    >
      {intersperse(
        crumbs.map(({ label, path }, i) => (
          <Link
            to={path}
            className={cn(
              'whitespace-nowrap text-sans-md hover:text-secondary',
              i === crumbs.length - 1 ? 'text-secondary' : 'text-tertiary'
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
  const logout = useApiMutation('logout', {
    onSuccess: () => navToLogin({ includeCurrent: false }),
  })
  // fetch happens in loader wrapping all authed pages
  const { me } = useCurrentUser()
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          buttonStyle({ size: 'sm', variant: 'ghost' }),
          'flex items-center gap-1.5 !px-2 !border-secondary'
        )}
        aria-label="User menu"
      >
        <Profile16Icon className="text-quaternary" />
        <span className="normal-case text-sans-md text-secondary">
          {me.displayName || 'User'}
        </span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content gap={8}>
        <DropdownMenu.LinkItem to={pb.profile()}>Settings</DropdownMenu.LinkItem>
        <DropdownMenu.Item onSelect={() => logout.mutate({})}>Sign out</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
