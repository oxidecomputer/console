/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { TypeValueCell, type Cell, type TypeValue } from '.'

export const TypeValueListCell = ({ value }: Cell<TypeValue[]>) => (
  <div className="flex flex-col gap-1">
    {value.map((v, i) => (
      <TypeValueCell key={i} value={v} />
    ))}
  </div>
)
