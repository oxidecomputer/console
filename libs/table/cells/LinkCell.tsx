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
        className="flex h-full w-full items-center text-sans-semi-md text-default hover:underline"
        to={makeHref(value)}
      >
        {value}
        {/* Pushes out the link area to the entire cell for improved clickability™ */}
        <div className="absolute inset-0" />
      </Link>
    )
  }
