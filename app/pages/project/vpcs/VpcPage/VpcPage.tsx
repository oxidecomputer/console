/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { Networking16Icon, Networking24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { QueryParamTabs } from '~/components/QueryParamTabs'
import { getVpcSelector, useVpcSelector } from '~/hooks'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { PAGE_SIZE } from '~/table/QueryTable'
import { DateTime } from '~/ui/lib/DateTime'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { Tabs } from '~/ui/lib/Tabs'
import { docLinks } from '~/util/links'

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
      query: { project, vpc, limit: PAGE_SIZE },
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
        <DocsPopover
          heading="VPCs"
          icon={<Networking16Icon />}
          summary="VPCs are private networks that serve to isolate sets of instances from each other. Instances within a VPC can talk to each other over private IP addresses (if firewall rules allow it) but communication between VPCs must happen through external IPs."
          links={[docLinks.vpcs, docLinks.firewallRules]}
        />
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
            <DateTime date={vpc.timeCreated} />
          </PropertiesTable.Row>
          <PropertiesTable.Row label="Last Modified">
            <DateTime date={vpc.timeModified} />
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>

      <QueryParamTabs className="full-width" defaultValue="firewall-rules">
        <Tabs.List>
          <Tabs.Trigger value="firewall-rules">Firewall Rules</Tabs.Trigger>
          <Tabs.Trigger value="subnets">Subnets</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="firewall-rules">
          <VpcFirewallRulesTab />
        </Tabs.Content>
        <Tabs.Content value="subnets">
          <VpcSubnetsTab />
        </Tabs.Content>
      </QueryParamTabs>
    </>
  )
}
