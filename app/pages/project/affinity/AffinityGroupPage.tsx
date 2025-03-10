/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { LoaderFunctionArgs } from 'react-router'

import { apiq, queryClient, usePrefetchedQuery } from '~/api'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getAffinityGroupSelector, useAffinityGroupSelector } from '~/hooks/use-params'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import { AffinityPageHeader } from './AffinityPage'

export const handle = makeCrumb(
  (p) => p.affinityGroup!,
  (p) => pb.affinityGroup(getAffinityGroupSelector(p))
)

const affinityGroupView = ({ project, affinityGroup }: PP.AffinityGroup) =>
  apiq('affinityGroupView', { path: { affinityGroup }, query: { project } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, affinityGroup } = getAffinityGroupSelector(params)
  await queryClient.prefetchQuery(affinityGroupView({ project, affinityGroup }))
  return null
}

export default function AffinityPage() {
  const { affinityGroup, project } = useAffinityGroupSelector()
  const {
    data: { description, timeCreated, timeModified },
  } = usePrefetchedQuery(affinityGroupView({ project, affinityGroup }))
  return (
    <>
      <AffinityPageHeader name={affinityGroup} />
      <PropertiesTable columns={2} className="-mt-8 mb-8">
        <PropertiesTable.DescriptionRow description={description} />
        <PropertiesTable.Row label="DNS Name">{affinityGroup}</PropertiesTable.Row>
        <PropertiesTable.DateRow date={timeCreated} label="Created" />
        <PropertiesTable.DateRow date={timeModified} label="Last Modified" />
      </PropertiesTable>

      {/* body content */}
    </>
  )
}
