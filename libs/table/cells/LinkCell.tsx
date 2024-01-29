/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Link } from 'react-router-dom'

import type { Cell } from './Cell'

export const linkCell =
  (makeHref: (value: string) => string) =>
  ({ value }: Cell<string>) => {
    return (
      <Link
        className="link-with-underline group flex h-full w-full items-center text-sans-semi-md"
        to={makeHref(value)}
      >
        {/* Pushes out the link area to the entire cell for improved clickability™ */}
        <div className="absolute inset-0 w-[calc(100%-1px)] group-hover:bg-raise" />
        <div className="relative">{value}</div>
      </Link>
    )
  }
