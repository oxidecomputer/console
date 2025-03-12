/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { RouteTabs, Tab } from '~/components/RouteTabs'
import { useProjectSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

import { AffinityPageHeader } from './utils'

export const handle = { crumb: 'Affinity' }

export default function AffinityPage() {
  const project = useProjectSelector()
  return (
    <>
      <AffinityPageHeader />
      <RouteTabs fullWidth>
        <Tab to={pb.antiAffinityGroups(project)}>Anti-Affinity Groups</Tab>
        <Tab to={pb.affinityGroups(project)}>Affinity Groups</Tab>
      </RouteTabs>
    </>
  )
}
