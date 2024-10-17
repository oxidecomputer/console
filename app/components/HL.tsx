/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { classed } from '~/util/classed'

export const HL = classed.span`text-sans-md text-default`

/** HL with "success"-colored text */
export const HLs = classed.span`text-sans-md text-accent children:text-accent`

// HL with "error"-colored text
export const HLe = classed.span`text-sans-md text-error children:text-error`

// HL with "info"-colored text
export const HLi = classed.span`text-sans-md text-notice children:text-notice`
