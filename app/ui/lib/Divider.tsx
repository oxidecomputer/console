/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { classed } from '@oxide/util'

/** Gets special styling from being inside `.ox-form` */
export const FormDivider = classed.hr`ox-divider w-full border-t border-secondary`

/** Needs !important styles to override :gutter thing on `<main>` */
export const Divider = classed.hr`!mx-0 !w-full border-t border-secondary`
