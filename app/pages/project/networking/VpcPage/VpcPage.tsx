import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import {
  Networking24Icon,
  PageHeader,
  PageTitle,
  PropertiesTable,
  Tabs2 as Tabs,
} from '@oxide/ui'
import { formatDateTime, toPathQuery } from '@oxide/util'

import { QueryTabs } from 'app/components/QueryTabs'
import { getVpcSelector, useVpcSelector } from 'app/hooks'

import { VpcFirewallRulesTab } from './tabs/VpcFirewallRulesTab'
import { VpcRoutersTab } from './tabs/VpcRoutersTab'
import { VpcSubnetsTab } from './tabs/VpcSubnetsTab'
import { VpcSystemRoutesTab } from './tabs/VpcSystemRoutesTab'

VpcPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery(
    'vpcViewV1',
    toPathQuery('vpc', getVpcSelector(params))
  )
  return null
}

export function VpcPage() {
  const vpcSelector = useVpcSelector()
  const { data: vpc } = useApiQuery('vpcViewV1', toPathQuery('vpc', vpcSelector))

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>{vpc?.name || ''}</PageTitle>
      </PageHeader>
      <PropertiesTable.Group className="mb-16">
        <PropertiesTable>
          <PropertiesTable.Row label="Description">{vpc?.description}</PropertiesTable.Row>
          <PropertiesTable.Row label="DNS Name">{vpc?.dnsName}</PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="Creation Date">
            {vpc?.timeCreated && formatDateTime(vpc.timeCreated)}
          </PropertiesTable.Row>
          <PropertiesTable.Row label="Last Modified">
            {vpc?.timeModified && formatDateTime(vpc.timeModified)}
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>

      <QueryTabs id="tabs-vpc-sections" className="full-width" defaultValue="subnets">
        <Tabs.List>
          <Tabs.Trigger value="subnets">Subnets</Tabs.Trigger>
          <Tabs.Trigger value="system-routes">System Routes</Tabs.Trigger>
          <Tabs.Trigger value="routers">Routers</Tabs.Trigger>
          <Tabs.Trigger value="firewall-rules">Firewall Rules</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="subnets">
          <VpcSubnetsTab />
        </Tabs.Content>
        <Tabs.Content value="system-routes">
          <VpcSystemRoutesTab />
        </Tabs.Content>
        <Tabs.Content value="routers">
          <VpcRoutersTab />
        </Tabs.Content>
        <Tabs.Content value="firewall-rules">
          <VpcFirewallRulesTab />
        </Tabs.Content>
      </QueryTabs>
    </>
  )
}
