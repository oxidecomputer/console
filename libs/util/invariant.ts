/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/**
 * Throw error if `condition` is falsy. Not using `tiny-invariant` because we
 * want the full error in production.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function invariant(condition: any, message: string): asserts condition {
  if (condition) return
  throw new Error(`Invariant failed: ${message}`)
}
