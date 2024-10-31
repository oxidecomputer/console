/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { classed } from '~/util/classed'

// note parent with secondary text color must have 'group' on it for
// this to work. see Toast for an example
export const HL = classed.span`
  text-sans-md text-default 
  group-[.text-accent-secondary]:text-accent
  group-[.text-error-secondary]:text-error
  group-[.text-info-secondary]:text-info
`
