/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/** When given a full URL hostname for an Oxide silo, return the domain
 * (everything after `<silo>.sys.`)
 */
export const getSubdomain = () => {
  const hostname = window.location.hostname
  return hostname === 'localhost' ? 'localhost' : hostname.split('.sys.')[1]
}
