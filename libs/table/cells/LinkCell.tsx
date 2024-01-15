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
      <>
        <Link className="peer absolute inset-0 flex h-full w-full" to={makeHref(value)} />
        <span className="text-sans-semi-md text-default peer-hover:underline">{value}</span>
      </>
    )
  }
