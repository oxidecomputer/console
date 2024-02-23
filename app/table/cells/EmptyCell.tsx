/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { classed } from '~/util/classed'

export const EmptyCell = () => <span className="text-sans-md text-quinary">&mdash;</span>

export const SkeletonCell = classed.div`h-4 w-12 rounded bg-tertiary motion-safe:animate-pulse`
