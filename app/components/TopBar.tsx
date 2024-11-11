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
import { DirectionDownIcon, Profile16Icon } from '@oxide/design-system/icons/react'

import { SiloSystemPicker } from '~/components/SystemSiloPicker'
import { useCrumbs } from '~/hooks/use-crumbs'
import { useCurrentUser } from '~/layouts/AuthenticatedLayout'
import { buttonStyle } from '~/ui/lib/Button'
import * as DropdownMenu from '~/ui/lib/DropdownMenu'
import { Identicon } from '~/ui/lib/Identicon'
import { Slash } from '~/ui/lib/Slash'
import { intersperse } from '~/util/array'
import { pb } from '~/util/path-builder'

export function TopBar({ systemOrSilo }: { systemOrSilo: 'system' | 'silo' }) {
  // The height of this component is governed by the `PageContainer`
  // It's important that this component returns two distinct elements (wrapped in a fragment).
  // Each element will occupy one of the top column slots provided by `PageContainer`.
  return (
    <>
      <div className="flex items-center border-b border-r px-3 border-secondary">
        <HomeButton />
      </div>
      {/* Height is governed by PageContainer grid */}
      <div className="flex items-center justify-between gap-4 border-b px-3 bg-default border-secondary">
        <div className="flex flex-1 gap-2.5">
          <SiloSystemPicker value={systemOrSilo} />
          <Breadcrumbs />
        </div>
        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </>
  )
}

const BigIdenticon = ({ name }: { name: string }) => (
  <Identicon
    className="flex h-[34px] w-[34px] items-center justify-center rounded text-accent bg-accent-secondary-hover"
    name={name}
  />
)

function HomeButton() {
  const { me } = useCurrentUser()
  return (
    <Link to={pb.projects()} className="-m-1 grow rounded-lg p-1 hover:bg-hover">
      <div className="flex min-w-[120px] max-w-[185px] items-center pr-2">
        <div className="mr-2 flex items-center">
          <BigIdenticon name={me.siloName} />
        </div>
        <div className="overflow-hidden">
          <div className="text-mono-xs text-quaternary">Silo</div>
          <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-sans-md text-secondary">
            {me.siloName}
          </div>
        </div>
      </div>
    </Link>
  )
}

function Breadcrumbs() {
  const crumbs = useCrumbs().filter((c) => !c.titleOnly)
  const isTopLevel = crumbs.length <= 1
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
              // make the last breadcrumb brighter, but only if we're below the top level
              !isTopLevel && i === crumbs.length - 1 ? 'text-secondary' : 'text-tertiary'
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
          buttonStyle({ size: 'sm', variant: 'secondary' }),
          'flex items-center gap-2'
        )}
        aria-label="User menu"
      >
        <Profile16Icon className="text-quaternary" />
        <span className="normal-case text-sans-md text-secondary">
          {me.displayName || 'User'}
        </span>
        <DirectionDownIcon className="!w-2.5" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content gap={8}>
        <DropdownMenu.LinkItem to={pb.profile()}>Settings</DropdownMenu.LinkItem>
        <DropdownMenu.Item onSelect={() => logout.mutate({})}>Sign out</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
