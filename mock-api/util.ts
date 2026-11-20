/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// this is only in its own file so it can be used in both the mock resources and
// the mock handlers without circular import issues

export function getTimestamps() {
  const now = new Date().toISOString()
  return { time_created: now, time_modified: now }
}

// A name-or-ID param is an ID if `Uuid::parse_str` accepts it, which takes any
// UUID version, not only v4.
// https://github.com/oxidecomputer/omicron/blob/aa28c9c/common/src/api/external/mod.rs#L357-L367
export const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
