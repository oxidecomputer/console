/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// the API gives conflicting guidance on the name format: the json schema
// definition allows uppercase letters but the actual implementation of the Name
// struct does not. I think the latter is more likely to be correct.
export const validateName = (value: string) => {
  // if (!/^[a-z](|[a-zA-Z0-9-]*[a-zA-Z0-9])$/.test(value)) {
  if (value.length === 0) {
    return 'A name is required'
  } else if (!/^[a-z]/.test(value)) {
    return 'Must start with a lower-case letter'
  } else if (!/[a-z0-9]$/.test(value)) {
    return 'Must end with a letter or number'
  } else if (!/^[a-z0-9-]+$/.test(value)) {
    return 'Can only contain lower-case letters, numbers, and dashes'
  }
}
