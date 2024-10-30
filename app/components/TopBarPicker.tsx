/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { Link } from 'react-router-dom'

import { SelectArrows6Icon, Success12Icon } from '@oxide/design-system/icons/react'

import { useCurrentUser } from '~/layouts/AuthenticatedLayout'
import { buttonStyle } from '~/ui/lib/Button'
import * as DropdownMenu from '~/ui/lib/DropdownMenu'
import { Identicon } from '~/ui/lib/Identicon'
import { Wrap } from '~/ui/util/wrap'
import { pb } from '~/util/path-builder'

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
        {props.current ? (
          <Wrap
            when={props.to}
            with={
              <Link to={props.to!} className="-m-1 grow rounded-lg p-1 hover:bg-hover" />
            }
          >
            <div className="flex min-w-[120px] max-w-[185px] items-center pr-2">
              {props.icon ? (
                <div className="mr-2 flex items-center">{props.icon}</div>
              ) : null}
              <div className="overflow-hidden">
                <div className="text-mono-xs text-quaternary">{props.category}</div>
                <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-sans-md text-secondary">
                  {props.display ?? props.current}
                </div>
              </div>
            </div>
          </Wrap>
        ) : (
          <DropdownMenu.Trigger
            className="group -m-1 flex items-center overflow-hidden rounded-lg p-1 text-left hover:bg-hover"
            aria-hidden // avoid doubling up on the select project trigger for screen readers
          >
            {props.icon ? <div className="mr-2 flex items-center">{props.icon}</div> : null}

            <div className="min-w-[5rem] text-mono-xs text-quaternary">
              Select
              <br />
              {props.category}
            </div>
          </DropdownMenu.Trigger>
        )}

        {props.items && (
          <div className="ml-2 shrink-0">
            <DropdownMenu.Trigger
              className={cn(
                'group h-[2rem] w-[1.125rem]',
                buttonStyle({ size: 'icon', variant: 'ghost' })
              )}
              aria-label={props['aria-label']}
            >
              {/* aria-hidden is a tip from the Reach docs */}
              <SelectArrows6Icon className="text-secondary" aria-hidden />
            </DropdownMenu.Trigger>
          </div>
        )}
      </div>
      {/* TODO: item size and focus highlight */}
      {/* TODO: popover position should be further right */}
      {props.items && (
        <DropdownMenu.Content
          className="mt-2 max-h-80 min-w-[12.8125rem] overflow-y-auto"
          anchor="bottom start"
        >
          {props.items.length > 0 ? (
            props.items.map(({ label, to }) => {
              const isSelected = props.current === label
              return (
                <DropdownMenu.LinkItem
                  key={label}
                  to={to}
                  className={cn({ 'is-selected': isSelected })}
                >
                  <span className="flex w-full items-center gap-2">
                    {label}
                    {isSelected && <Success12Icon className="-mr-3 block" />}
                  </span>
                </DropdownMenu.LinkItem>
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
  const { me, isFleetViewer } = useCurrentUser()

  // if the user can't see the picker, show a placeholder control with their
  // silo name that links to root/home
  if (!isFleetViewer) {
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
