/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import {
  Badge,
  Cloud24Icon,
  EmptyMessage,
  NextArrow12Icon,
  PageHeader,
  PageTitle,
  PropertiesTable,
  TableEmptyBox,
  Tabs,
} from '@oxide/ui'
import { formatDateTime } from '@oxide/util'

import { QueryParamTabs } from 'app/components/QueryParamTabs'
import { getSiloSelector, useSiloSelector } from 'app/hooks'

import { SiloIdpsTab } from './SiloIdpsTab'
import { SiloIpPoolsTab } from './SiloIpPoolsTab'

SiloPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { silo } = getSiloSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('siloView', { path: { silo } }),
    apiQueryClient.prefetchQuery('siloIdentityProviderList', {
      query: { silo, limit: 25 }, // match QueryTable
    }),
    apiQueryClient.prefetchQuery('siloIpPoolList', {
      query: { limit: 25 }, // match QueryTable
      path: { silo },
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

      <PropertiesTable.Group className="mb-16">
        <PropertiesTable>
          <PropertiesTable.Row label="ID">{silo.id}</PropertiesTable.Row>
          <PropertiesTable.Row label="Description">{silo.description}</PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="Creation Date">
            {formatDateTime(silo.timeCreated)}
          </PropertiesTable.Row>
          <PropertiesTable.Row label="Last Modified">
            {formatDateTime(silo.timeModified)}
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>

      <QueryParamTabs id="silo-networking-tabs" className="full-width" defaultValue="idps">
        <Tabs.List>
          <Tabs.Trigger value="idps">Identity Providers</Tabs.Trigger>
          <Tabs.Trigger value="ip-pools">IP Pools</Tabs.Trigger>
          <Tabs.Trigger value="fleet-roles">Fleet roles</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="idps">
          <SiloIdpsTab />
        </Tabs.Content>
        <Tabs.Content value="ip-pools">
          <SiloIpPoolsTab />
        </Tabs.Content>
        <Tabs.Content value="fleet-roles">
          {/* TODO: better empty state explaining that no roles are mapped so nothing will happen */}
          {roleMapPairs.length === 0 ? (
            <TableEmptyBox>
              <EmptyMessage
                icon={<Cloud24Icon />}
                title="Mapped fleet roles"
                body="Silo roles can automatically grant a fleet role. This silo has no role mappings configured."
              />
            </TableEmptyBox>
          ) : (
            <>
              <p className="mb-4 text-secondary">
                Silo roles can automatically grant a fleet role.
              </p>
              <ul className="space-y-3">
                {roleMapPairs.map(([siloRole, fleetRole]) => (
                  <li key={siloRole + '|' + fleetRole} className="flex items-center">
                    <Badge>Silo {siloRole}</Badge>
                    <NextArrow12Icon className="mx-3 text-secondary" aria-label="maps to" />
                    <span className="text-sans-md text-secondary">Fleet {fleetRole}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Tabs.Content>
      </QueryParamTabs>
    </>
  )
}
