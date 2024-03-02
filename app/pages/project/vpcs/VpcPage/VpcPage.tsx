/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { Networking24Icon, Tabs } from '@oxide/ui'
import { formatDateTime } from '@oxide/util'

import { EmptyCell } from '~/table/cells/EmptyCell'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { QueryParamTabs } from 'app/components/QueryParamTabs'
import { getVpcSelector, useVpcSelector } from 'app/hooks'

import { VpcFirewallRulesTab } from './tabs/VpcFirewallRulesTab'
import { VpcSubnetsTab } from './tabs/VpcSubnetsTab'

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
          <PropertiesTable.Row label="Description">
            {vpc.description || <EmptyCell />}
          </PropertiesTable.Row>
          <PropertiesTable.Row label="DNS Name">{vpc.dnsName}</PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="Created">
            {formatDateTime(vpc.timeCreated)}
          </PropertiesTable.Row>
          <PropertiesTable.Row label="Last Modified">
            {formatDateTime(vpc.timeModified)}
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>

      <QueryParamTabs className="full-width" defaultValue="subnets">
        <Tabs.List>
          <Tabs.Trigger value="subnets">Subnets</Tabs.Trigger>
          <Tabs.Trigger value="firewall-rules">Firewall Rules</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="subnets">
          <VpcSubnetsTab />
        </Tabs.Content>
        <Tabs.Content value="firewall-rules">
          <VpcFirewallRulesTab />
        </Tabs.Content>
      </QueryParamTabs>
    </>
  )
}
