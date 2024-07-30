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
