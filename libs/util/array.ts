/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
const identity = (x: any) => x

/** Returns a new array sorted by `by`. Assumes return value of `by` is
 * comparable. Default value of `by` is the identity function. */
export function sortBy<T>(arr: T[], by: (t: T) => any = identity): T[] {
  const copy = [...arr]
  copy.sort((a, b) => (by(a) < by(b) ? -1 : by(a) > by(b) ? 1 : 0))
  return copy
}

/** Equivalent to `sortBy(...)[0]` but O(N) */
export function lowestBy<T>(arr: T[], by: (t: T) => any = identity): T | undefined {
  if (arr.length === 0) return undefined

  let lowest = arr[0]
  let lowestScore = by(arr[0])
  for (let i = 1; i < arr.length; i++) {
    const score = by(arr[i])
    if (score < lowestScore) {
      lowest = arr[i]
      lowestScore = score
    }
  }
  return lowest
}
/* eslint-enable @typescript-eslint/no-explicit-any */

type GroupKey = string | number | symbol

export function groupBy<T>(arr: T[], by: (t: T) => GroupKey) {
  const groups: Record<GroupKey, T[]> = {}
  for (const item of arr) {
    const key = by(item)
    if (!(key in groups)) {
      groups[key] = []
    }
    groups[key].push(item)
  }
  return Object.entries(groups)
}

/**
 * Split a list into two, one with `by(item)` true, the other with `by(item)`
 * false
 */
export function partitionBy<T>(arr: T[], by: (t: T) => boolean): [T[], T[]] {
  const yes: T[] = []
  const no: T[] = []
  for (const item of arr) {
    const target = by(item) ? yes : no
    target.push(item)
  }
  return [yes, no]
}

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T

/**
 * TS-friendly version of `Boolean` for when you want to filter for truthy
 * values. Use `.filter(isTruthy)` instead of `.filter(Boolean)`. See
 * [StackOverflow](https://stackoverflow.com/a/58110124/604986).
 */
export function isTruthy<T>(value: T): value is Truthy<T> {
  return !!value
}

export function sumBy<T>(items: T[], fn: (item: T) => number): number {
  return items.map(fn).reduce((a, b) => a + b, 0)
}

/**
 * If a conjunction is included, use that instead of `sep` when there are two items.
 */
export function intersperse<T>(items: T[], sep: T, conj?: T): T[] {
  if (items.length <= 1) return items
  if (conj && items.length === 2) return [items[0], conj, items[1]]
  return items.flatMap((item, i) => {
    if (i === 0) return [item]
    if (conj && i === items.length - 1) return [sep, conj, item]
    return [sep, item]
  })
}
