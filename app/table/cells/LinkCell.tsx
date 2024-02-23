/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Link } from 'react-router-dom'

import { classed } from '@oxide/util'

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
