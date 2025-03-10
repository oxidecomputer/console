/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { makeCrumb } from '~/hooks/use-crumbs'
import {
  getAntiAffinityGroupSelector,
  useAntiAffinityGroupSelector,
} from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

import { AffinityPageHeader } from './AffinityPage'

export const handle = makeCrumb(
  (p) => p.antiAffinityGroup!,
  (p) => pb.antiAffinityGroup(getAntiAffinityGroupSelector(p))
)

export default function AffinityPage() {
  const { antiAffinityGroup } = useAntiAffinityGroupSelector()
  return (
    <>
      <AffinityPageHeader name={antiAffinityGroup} />
      {/* header content */}
      {/* body content */}
    </>
  )
}
