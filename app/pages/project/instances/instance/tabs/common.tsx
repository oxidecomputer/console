/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { cloneElement } from 'react'

import { intersperse } from '@oxide/util'

const white = (s: string) => (
  <span key={s} className="text-default">
    {s}
  </span>
)

export const fancifyStates = (states: string[]) =>
  intersperse(states.map(white), <>, </>, <> or </>).map((item, index) =>
    cloneElement(item, { key: index })
  )
