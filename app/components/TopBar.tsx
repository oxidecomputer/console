/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

import { api, navToLogin, useApiMutation } from '@oxide/api'
import {
  MenuClose12Icon,
  MenuOpen12Icon,
  Monitor12Icon,
  Moon12Icon,
  More12Icon,
  Organization16Icon,
  Profile16Icon,
  SelectArrows6Icon,
  Servers16Icon,
  Success12Icon,
  Sun12Icon,
} from '@oxide/design-system/icons/react'

import { useCrumbs } from '~/hooks/use-crumbs'
import { useCurrentUser } from '~/hooks/use-current-user'
import { topBarHomeCellClass, topBarWrapperClass } from '~/layouts/helpers'
import { toggleMobileNav, useMobileNavStore } from '~/stores/mobile-nav'
import { useThemeStore, type Theme } from '~/stores/theme'
import { buttonStyle } from '~/ui/lib/Button'
import * as DropdownMenu from '~/ui/lib/DropdownMenu'
import { Identicon } from '~/ui/lib/Identicon'
import { Slash } from '~/ui/lib/Slash'
import { pb } from '~/util/path-builder'

export function TopBar({ systemOrSilo }: { systemOrSilo: 'system' | 'silo' }) {
  const { me } = useCurrentUser()
  return (
    <div className={topBarWrapperClass}>
      <div className={cn(topBarHomeCellClass, 'px-2')}>
        <HomeButton level={systemOrSilo} />
      </div>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <MobileNavToggle />
          <Breadcrumbs />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {me.fleetViewer && <SiloSystemPicker level={systemOrSilo} />}
          <UserMenu />
        </div>
      </div>
    </div>
  )
}

function MobileNavToggle() {
  const isOpen = useMobileNavStore((state) => state.isOpen)
  const Icon = isOpen ? MenuClose12Icon : MenuOpen12Icon
  return (
    // full-height cell with a right border so the toggle reads as its own
    // region, mirroring the desktop home button cell
    <div className="border-secondary 1000:hidden -ml-3 flex h-(--top-bar-height) shrink-0 items-center border-r px-1.5">
      <button
        type="button"
        onClick={toggleMobileNav}
        aria-label="Toggle sidebar"
        aria-expanded={isOpen}
        className="hover:bg-hover flex h-10 w-10 items-center justify-center rounded-md"
      >
        <Icon className="text-secondary" />
      </button>
    </div>
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
  const lastCrumb = crumbs.length - 1
  const { firstVisibleCrumb, measurementRef, navRef } = useBreadcrumbOverflow(crumbs)
  const hasHiddenCrumbs = firstVisibleCrumb > 0
  const visibleCrumbs = crumbs.slice(firstVisibleCrumb)

  return (
    <nav
      ref={navRef}
      // x-only clip: it exists to keep the measurement copies and long crumbs from
      // causing page overflow, and y must stay visible so the overflow trigger's
      // expanded hit target (before:-inset-4) isn't clipped to the 18px nav height
      className="text-sans-md relative flex min-w-0 flex-1 items-center gap-0.5 overflow-x-clip"
      aria-label="Breadcrumbs"
    >
      {hasHiddenCrumbs && (
        <>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              aria-label="Show full breadcrumb path"
              className="text-secondary hover:text-default relative flex shrink-0 items-center before:absolute before:-inset-4 before:content-['']"
            >
              <More12Icon className="translate-y-0.5 rotate-90" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              anchor="bottom start"
              className="max-w-[calc(100vw-2rem)]"
              gap={8}
              zIndex="topBar"
            >
              {crumbs.map(({ label, path }, i) => (
                <DropdownMenu.LinkItem
                  key={`${label}|${path}`}
                  to={path}
                  className={cn(
                    'wrap-break-word whitespace-normal',
                    i === lastCrumb && 'is-selected'
                  )}
                >
                  {label}
                </DropdownMenu.LinkItem>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <Slash className="shrink-0" />
        </>
      )}
      {visibleCrumbs.map(({ label, path }, visibleIndex) => {
        const crumbIndex = firstVisibleCrumb + visibleIndex
        return (
          <Fragment key={`${label}|${path}`}>
            {visibleIndex > 0 && <Slash className="shrink-0" />}
            <Link
              to={path}
              aria-current={crumbIndex === lastCrumb ? 'page' : undefined}
              className={cn(
                'text-sans-md whitespace-nowrap',
                crumbIndex === lastCrumb
                  ? 'text-raise min-w-0 overflow-hidden text-ellipsis'
                  : 'text-secondary hover:text-default shrink-0'
              )}
            >
              {label}
            </Link>
          </Fragment>
        )
      })}
      {/* Keep natural-width copies available after their interactive counterparts collapse. */}
      <div
        ref={measurementRef}
        aria-hidden
        className="invisible absolute top-0 left-0 flex w-max items-center gap-0.5 whitespace-nowrap"
      >
        <span data-breadcrumb-ellipsis className="block h-3 w-3 shrink-0" />
        <Slash className="breadcrumb-measure-slash shrink-0" />
        {crumbs.map(({ label, path }) => (
          <span data-breadcrumb-crumb key={`${label}|${path}`}>
            {label}
          </span>
        ))}
      </div>
    </nav>
  )
}

type Breadcrumb = ReturnType<typeof useCrumbs>[number]

function useBreadcrumbOverflow(crumbs: Breadcrumb[]) {
  const navRef = useRef<HTMLElement>(null)
  const measurementRef = useRef<HTMLDivElement>(null)
  const [firstVisibleCrumb, setFirstVisibleCrumb] = useState(() =>
    Math.max(0, crumbs.length - 1)
  )
  const crumbLabels = crumbs.map(({ label }) => label).join('\0')

  useLayoutEffect(() => {
    const nav = navRef.current
    const measurement = measurementRef.current
    if (!nav || !measurement || crumbs.length === 0) return

    const update = () => {
      const crumbElements = Array.from(
        measurement.querySelectorAll<HTMLElement>('[data-breadcrumb-crumb]')
      )
      const ellipsis = measurement.querySelector<HTMLElement>('[data-breadcrumb-ellipsis]')
      const slash = measurement.querySelector<HTMLElement>('.breadcrumb-measure-slash')
      if (crumbElements.length !== crumbs.length || !ellipsis || !slash) return

      const style = getComputedStyle(measurement)
      const gap = Number.parseFloat(style.columnGap) || 0
      const slashStyle = getComputedStyle(slash)
      const slashWidth =
        slash.getBoundingClientRect().width +
        (Number.parseFloat(slashStyle.marginLeft) || 0) +
        (Number.parseFloat(slashStyle.marginRight) || 0)
      const ellipsisWidth = ellipsis.getBoundingClientRect().width
      const crumbWidths = crumbElements.map(
        (element) => element.getBoundingClientRect().width
      )
      const lastCrumbIndex = crumbs.length - 1

      // Prefer the longest complete suffix that fits. The current crumb remains when no
      // suffix fits and its CSS ellipsis becomes the final fallback.
      let nextFirstVisible = lastCrumbIndex
      for (let candidate = 0; candidate <= lastCrumbIndex; candidate++) {
        const visibleCount = crumbs.length - candidate
        const visibleCrumbWidth = crumbWidths
          .slice(candidate)
          .reduce((total, width) => total + width, 0)
        const separatorWidth = (visibleCount - 1) * (slashWidth + gap * 2)
        const collapsedPrefixWidth =
          candidate > 0 ? ellipsisWidth + slashWidth + gap * 2 : 0

        if (visibleCrumbWidth + separatorWidth + collapsedPrefixWidth <= nav.clientWidth) {
          nextFirstVisible = candidate
          break
        }
      }

      setFirstVisibleCrumb((current) =>
        current === nextFirstVisible ? current : nextFirstVisible
      )
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(nav)
    observer.observe(measurement)
    return () => observer.disconnect()
  }, [crumbLabels, crumbs.length])

  return {
    firstVisibleCrumb: Math.min(firstVisibleCrumb, Math.max(0, crumbs.length - 1)),
    measurementRef,
    navRef,
  }
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
          <span className="text-sans-md text-default max-1000:hidden normal-case">
            {me.displayName || 'User'}
          </span>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content gap={8} zIndex="topBar">
        <DropdownMenu.Group>
          <DropdownMenu.GroupLabel className="border-secondary 1000:hidden border-b px-3 py-2">
            <div className="text-mono-xs text-tertiary">User</div>
            <div className="text-sans-md text-default mt-0.5">
              {me.displayName || 'User'}
            </div>
          </DropdownMenu.GroupLabel>
          <DropdownMenu.LinkItem to={pb.profile()}>Settings</DropdownMenu.LinkItem>
          <ThemeSubmenu />
          <DropdownMenu.Item onSelect={() => logout.mutate({})} label="Sign out" />
        </DropdownMenu.Group>
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
      <DropdownMenu.Content className="mt-2" anchor="bottom start" zIndex="topBar">
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
