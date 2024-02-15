/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type Cell } from './Cell'
import { TypeValueCell, type TypeValue } from './TypeValueCell'

export const TypeValueListCell = ({ value }: Cell<TypeValue[]>) => (
  <div>
    {value.map((v, i) => (
      <TypeValueCell key={i} value={v} />
    ))}
  </div>
)
