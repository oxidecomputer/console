/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { makeCrumb } from '~/hooks/use-crumbs'
import { getAffinityGroupSelector, useAffinityGroupSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

import { AffinityPageHeader } from './AffinityPage'

export const handle = makeCrumb(
  (p) => p.affinity!,
  (p) => pb.affinityGroup(getAffinityGroupSelector(p))
)

export default function AffinityPage() {
  const { affinityGroup } = useAffinityGroupSelector()
  return (
    <>
      <AffinityPageHeader name={affinityGroup} />
      {/* header content */}
      {/* body content */}
    </>
  )
}
