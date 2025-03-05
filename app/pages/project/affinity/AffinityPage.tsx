/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { makeCrumb } from '~/hooks/use-crumbs'
import { getAffinitySelector, useAffinitySelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

import { AffinityPageHeader } from './AffinityIndexPage'

export const handle = makeCrumb(
  (p) => p.affinity!,
  (p) => pb.affinity(getAffinitySelector(p))
)

export default function AffinityPage() {
  const { affinity } = useAffinitySelector()
  return (
    <>
      <AffinityPageHeader name={affinity} />
      {/* header content */}
      {/* body content */}
    </>
  )
}
