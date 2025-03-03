/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type LoaderFunctionArgs } from 'react-router'

import { apiQueryClient, queryClient, usePrefetchedApiQuery } from '@oxide/api'
import { Cloud16Icon, Cloud24Icon, NextArrow12Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { QueryParamTabs } from '~/components/QueryParamTabs'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getSiloSelector, useSiloSelector } from '~/hooks/use-params'
import { Badge } from '~/ui/lib/Badge'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { TableEmptyBox } from '~/ui/lib/Table'
import { Tabs } from '~/ui/lib/Tabs'
import { docLinks } from '~/util/links'

import { siloIdpList, SiloIdpsTab } from './SiloIdpsTab'
import { siloIpPoolsQuery, SiloIpPoolsTab } from './SiloIpPoolsTab'
import { SiloQuotasTab } from './SiloQuotasTab'

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { silo } = getSiloSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('siloView', { path: { silo } }),
    apiQueryClient.prefetchQuery('siloUtilizationView', { path: { silo } }),
    queryClient.prefetchQuery(siloIdpList(silo).optionsFn()),
    queryClient.prefetchQuery(siloIpPoolsQuery(silo).optionsFn()),
  ])
  return null
}

export const handle = makeCrumb((p) => p.silo!)

export default function SiloPage() {
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
        <DocsPopover
          heading="silos"
          icon={<Cloud16Icon />}
          summary="Silos provide strict tenancy separation between groups of users. Each silo has its own resource limits and access policies as well as its own subdomain for the web console and API."
          links={[
            docLinks.systemSilo,
            docLinks.identityProviders,
            docLinks.systemIpPools,
            docLinks.access,
          ]}
        />
      </PageHeader>

      <PropertiesTable columns={2} className="-mt-8 mb-8">
        <PropertiesTable.IdRow id={silo.id} />
        <PropertiesTable.DescriptionRow description={silo.description} />
        <PropertiesTable.DateRow date={silo.timeCreated} label="Created" />
        <PropertiesTable.DateRow date={silo.timeModified} label="Last Modified" />
      </PropertiesTable>

      <QueryParamTabs className="full-width" defaultValue="idps">
        <Tabs.List>
          <Tabs.Trigger value="idps">Identity Providers</Tabs.Trigger>
          <Tabs.Trigger value="ip-pools">IP Pools</Tabs.Trigger>
          <Tabs.Trigger value="quotas">Quotas</Tabs.Trigger>
          <Tabs.Trigger value="fleet-roles">Fleet roles</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="idps">
          <SiloIdpsTab />
        </Tabs.Content>
        <Tabs.Content value="ip-pools">
          <SiloIpPoolsTab />
        </Tabs.Content>
        <Tabs.Content value="quotas">
          <SiloQuotasTab />
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
              <p className="mb-4 text-default">
                Silo roles can automatically grant a fleet role.
              </p>
              <ul className="space-y-3">
                {roleMapPairs.map(([siloRole, fleetRole]) => (
                  <li key={siloRole + '|' + fleetRole} className="flex items-center">
                    <Badge>Silo {siloRole}</Badge>
                    <NextArrow12Icon className="mx-3 text-default" aria-label="maps to" />
                    <span className="text-sans-md text-default">Fleet {fleetRole}</span>
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
