/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { EmptyCell } from '@oxide/table'
import {
  Badge,
  Cloud24Icon,
  Divider,
  NextArrow12Icon,
  PageHeader,
  PageTitle,
  Question12Icon,
  Tabs,
  Tooltip,
} from '@oxide/ui'

import { QueryParamTabs } from 'app/components/QueryParamTabs'
import { getSiloSelector, useSiloSelector } from 'app/hooks'

import { SiloIdpsTab } from './SiloIdpsTab'
import { SiloIpPoolsTab } from './SiloIpPoolsTab'

const RoleMappingTooltip = () => (
  <Tooltip content="Silo roles can automatically grant a fleet role" placement="top">
    <button className="ml-2 flex svg:pointer-events-none">
      <Question12Icon className="text-quinary" />
    </button>
  </Tooltip>
)

SiloPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { silo } = getSiloSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('siloView', { path: { silo } }),
    apiQueryClient.prefetchQuery('siloIdentityProviderList', {
      query: { silo, limit: 25 }, // same as query table
    }),
  ])
  return null
}

export function SiloPage() {
  const siloSelector = useSiloSelector()

  const { data: silo } = usePrefetchedApiQuery('siloView', { path: siloSelector })

  const roleMapPairs = Object.entries(silo.mappedFleetRoles).flatMap(
    ([fleetRole, siloRoles]) =>
      siloRoles.map((siloRole) => [siloRole, fleetRole] as [string, string])
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Cloud24Icon />}>{silo.name}</PageTitle>
      </PageHeader>
      <h2 className="mb-6 flex items-center text-mono-sm text-secondary">
        Fleet role mapping <RoleMappingTooltip />
      </h2>
      {roleMapPairs.length === 0 ? (
        <EmptyCell />
      ) : (
        <ul className="space-y-3">
          {roleMapPairs.map(([siloRole, fleetRole]) => (
            <li key={siloRole + '|' + fleetRole} className="flex items-center">
              <Badge>Silo {siloRole}</Badge>
              <NextArrow12Icon className="mx-3 text-secondary" aria-label="maps to" />
              <span className="text-sans-md text-secondary">Fleet {fleetRole}</span>
            </li>
          ))}
        </ul>
      )}
      <Divider className="mt-10" />
      <QueryParamTabs id="silo-networking-tabs" className="full-width" defaultValue="idps">
        <Tabs.List>
          <Tabs.Trigger value="idps">Identity Providers</Tabs.Trigger>
          <Tabs.Trigger value="silo-ip-pools">Firewall Rules</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="idps">
          <SiloIdpsTab />
        </Tabs.Content>
        <Tabs.Content value="silo-ip-pools">
          <SiloIpPoolsTab />
        </Tabs.Content>
      </QueryParamTabs>
    </>
  )
}
