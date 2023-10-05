/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  ...keys: K[]
) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => keys.includes(key as never))
  ) as Pick<T, K>

export const exclude = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  ...keys: K[]
) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as never))
  ) as Exclude<T, K>

export function mapValues<K extends string, V0, V>(
  obj: Record<K, V0>,
  fn: (value: V0, key: K) => V
) {
  return Object.fromEntries(
    Object.entries<V0>(obj).map(([key, value]) => [key, fn(value, key as K)])
  ) as Record<K, V>
}
