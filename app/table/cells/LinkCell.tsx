/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { CellContext } from '@tanstack/react-table'
import { Link } from 'react-router-dom'

import { classed } from '~/util/classed'

import type { Cell } from './Cell'

const linkClass =
  'link-with-underline group flex h-full w-full items-center text-sans-semi-md'

/** Pushes out the link area to the entire cell for improved clickability™ */
const Pusher = classed.div`absolute inset-0 right-px group-hover:bg-raise`

export const linkCell =
  (makeHref: (value: string) => string) =>
  ({ value }: Cell<string>) => {
    return <LinkCell to={makeHref(value)}>{value}</LinkCell>
  }

/**
 * Because this returns a component, it should only be used in a static context
 * or memoized with useCallback. It should not be used unmemoized inside the
 * render loop. It's probably better to inline the contents directly at the call
 * site if it needs to be called inside render.
 */
export const makeLinkCell =
  (makeHref: (value: string) => string) =>
  <T, U extends string>(props: CellContext<T, U>) => {
    const value = props.getValue()
    return <LinkCell to={makeHref(value)}>{value}</LinkCell>
  }

export function LinkCell({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link className={linkClass} to={to}>
      <Pusher />
      <div className="relative">{children}</div>
    </Link>
  )
}

export const ButtonCell = ({ children, ...props }: React.ComponentProps<'button'>) => {
  return (
    <button className={linkClass} {...props}>
      <Pusher />
      <div className="relative">{children}</div>
    </button>
  )
}
