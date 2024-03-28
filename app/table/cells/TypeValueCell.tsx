/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Badge } from '~/ui/lib/Badge'

import type { Cell } from './Cell'

export type TypeValue = {
  type: string
  value: string
}

export const TypeValueCell = ({ value: { type, value } }: Cell<TypeValue>) => (
  <div className="space-x-1">
    <Badge>{type}</Badge>
    <Badge variant="solid">{value}</Badge>
  </div>
)
