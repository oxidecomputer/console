/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { Networking24Icon, PageHeader, PageTitle, PropertiesTable } from '@oxide/ui'
import { formatDateTime } from '@oxide/util'

import { RouteTabs, Tab } from 'app/components/RouteTabs'
import { getVpcSelector, useVpcSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

VpcPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc } = getVpcSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('vpcView', { path: { vpc }, query: { project } }),
    apiQueryClient.prefetchQuery('vpcFirewallRulesView', {
      query: { project, vpc },
    }),
    apiQueryClient.prefetchQuery('vpcSubnetList', {
      query: { project, vpc, limit: 25 },
    }),
  ])
  return null
}

export function VpcPage() {
  const { project, vpc: vpcName } = useVpcSelector()
  const { data: vpc } = usePrefetchedApiQuery('vpcView', {
    path: { vpc: vpcName },
    query: { project },
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>{vpc.name}</PageTitle>
      </PageHeader>
      <PropertiesTable.Group className="mb-16">
        <PropertiesTable>
          <PropertiesTable.Row label="Description">{vpc.description}</PropertiesTable.Row>
          <PropertiesTable.Row label="DNS Name">{vpc.dnsName}</PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="Creation Date">
            {vpc.timeCreated && formatDateTime(vpc.timeCreated)}
          </PropertiesTable.Row>
          <PropertiesTable.Row label="Last Modified">
            {vpc.timeModified && formatDateTime(vpc.timeModified)}
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>

      <RouteTabs fullWidth>
        <Tab to={pb.vpcSubnets({ project: project, vpc: vpc.name })}>Subnets</Tab>
        <Tab to={pb.vpcFirewallRules({ project: project, vpc: vpc.name })}>
          Firewall Rules
        </Tab>
      </RouteTabs>
    </>
  )
}
