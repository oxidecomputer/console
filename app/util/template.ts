/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
export const incrementName = (str: string) => {
  let name = str
  const match = name.match(/(.*)-(\d+)$/)

  if (match) {
    const base = match[1]
    const num = parseInt(match[2], 10)
    name = `${base}-${num + 1}`
  } else {
    name = `${name}-1`
  }

  return name
}
