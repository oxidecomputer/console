/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { cloneElement, type ReactElement } from 'react'
import * as R from 'remeda'

/* eslint-disable @typescript-eslint/no-explicit-any */
const identity = (x: any) => x

/** Returns a new array sorted by `by`. Assumes return value of `by` is
 * comparable. Default value of `by` is the identity function. */
export function sortBy<T>(arr: T[], by: (t: T) => any = identity): T[] {
  return R.sortBy(arr, by)
}

type GroupKey = string | number | symbol

export function groupBy<T>(arr: T[], by: (t: T) => GroupKey) {
  return Object.entries(R.groupBy(arr, by))
}

/**
 * Split a list into two, one with `by(item)` true, the other with `by(item)`
 * false
 */
export function partitionBy<T>(arr: T[], by: (t: T) => boolean): [T[], T[]] {
  return R.partition(arr, by)
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

/**
 * Split array at first element where `by` is true. That element lands in the second array.
 */
export function splitOnceBy<T>(array: T[], by: (t: T) => boolean) {
  return R.splitWhen(array, by)
}
