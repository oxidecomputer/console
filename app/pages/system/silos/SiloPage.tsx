/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type LoaderFunctionArgs } from 'react-router'

import { Cloud16Icon, Cloud24Icon } from '@oxide/design-system/icons/react'

import { apiq, queryClient, usePrefetchedQuery } from '~/api'
import { DocsPopover } from '~/components/DocsPopover'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getSiloSelector, useSiloSelector } from '~/hooks/use-params'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { silo } = getSiloSelector(params)
  await queryClient.prefetchQuery(apiq('siloView', { path: { silo } }))
  return null
}

export const handle = makeCrumb((p) => p.silo!)

export default function SiloPage() {
  const siloSelector = useSiloSelector()

  const { data: silo } = usePrefetchedQuery(apiq('siloView', { path: siloSelector }))

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

      <RouteTabs fullWidth>
        <Tab to={pb.siloIdps(siloSelector)}>Identity Providers</Tab>
        <Tab to={pb.siloIpPools(siloSelector)}>Linked Pools</Tab>
        <Tab to={pb.siloQuotas(siloSelector)}>Quotas</Tab>
        <Tab to={pb.siloFleetRoles(siloSelector)}>Fleet roles</Tab>
        <Tab to={pb.siloScim(siloSelector)}>SCIM</Tab>
      </RouteTabs>
    </>
  )
}
