/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

export const camelToSnake = (s: string) => s.replace(/[A-Z]/g, (l) => '_' + l.toLowerCase())

export const snakeToCamel = (s: string) => s.replace(/_./g, (l) => l[1].toUpperCase())

export const isObjectOrArray = (o: unknown) =>
  typeof o === 'object' &&
  !(o instanceof Date) &&
  !(o instanceof RegExp) &&
  !(o instanceof Error) &&
  o !== null

/**
 * Recursively map (k, v) pairs using Object.entries
 *
 * Note that value transform function takes both k and v so we can use the key
 * to decide whether to transform the value.
 *
 * @param kf maps key to key
 * @param vf maps key + value to value
 */
export const mapObj =
  (
    kf: (k: string) => string,
    vf: (k: string | undefined, v: unknown) => unknown = (k, v) => v
  ) =>
  (o: unknown): unknown => {
    if (!isObjectOrArray(o)) return o

    if (Array.isArray(o)) return o.map(mapObj(kf, vf))

    const newObj: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      newObj[kf(k)] = isObjectOrArray(v) ? mapObj(kf, vf)(v) : vf(k, v)
    }
    return newObj
  }

export const parseIfDate = (k: string | undefined, v: unknown) => {
  if (typeof v === 'string' && (k?.startsWith('time_') || k === 'timestamp')) {
    const d = new Date(v)
    if (isNaN(d.getTime())) return v
    return d
  }
  return v
}

export const snakeify = mapObj(camelToSnake)

export const processResponseBody = mapObj(snakeToCamel, parseIfDate)

export function isNotNull<T>(value: T): value is NonNullable<T> {
  return value != null
}

export const uniqueItems = [
  <T>(arr: T[]) => new Set(arr).size === arr.length,
  { message: 'Items must be unique' },
] as const
