/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { cloneElement, type ReactElement } from 'react'
import * as R from 'remeda'

type GroupKey = string | number | symbol

export function groupBy<T>(arr: T[], by: (t: T) => GroupKey) {
  return Object.entries(R.groupBy(arr, by))
}

/**
 * If a conjunction is included, use that instead of `sep` when there are two items.
 */
export function intersperse(
  items: ReactElement[],
  sep: ReactElement,
  conj?: ReactElement
): ReactElement[] {
  if (items.length <= 1) return items
  if (conj && items.length === 2) {
    const conj0 = cloneElement(conj, { key: `conj` })
    return [items[0], conj0, items[1]]
  }
  return items.flatMap((item, i) => {
    if (i === 0) return [item]
    const sep0 = cloneElement(sep, { key: `sep-${i}` })
    if (conj && i === items.length - 1) {
      const conj0 = cloneElement(conj, { key: `conj` })
      return [sep0, conj0, item]
    }
    return [sep0, item]
  })
}

export function isSetEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false
  for (const item of a) {
    if (!b.has(item)) {
      return false
    }
  }
  return true
}

/** Set `a - b` */
export function setDiff<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter((x) => !b.has(x)))
}
