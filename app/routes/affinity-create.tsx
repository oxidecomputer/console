/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { makeCrumb } from '~/hooks/use-crumbs'
import { getProjectSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

export { default, clientLoader } from '~/pages/project/affinity/AffinityPage'

export const handle = makeCrumb('Affinity Groups', (p) =>
  pb.affinity(getProjectSelector(p))
)
