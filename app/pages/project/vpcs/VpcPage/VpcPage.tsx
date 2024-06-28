/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { Networking24Icon } from '@oxide/design-system/icons/react'

import { RouteTabs, Tab } from '~/components/RouteTabs'
import { getVpcSelector, useVpcSelector } from '~/hooks'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { DateTime } from '~/ui/lib/DateTime'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { pb } from '~/util/path-builder'

import { VpcDocsPopover } from '../VpcsPage'

VpcPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc } = getVpcSelector(params)
  await apiQueryClient.prefetchQuery('vpcView', { path: { vpc }, query: { project } })
  return null
}

export function VpcPage() {
  const vpcSelector = useVpcSelector()
  const { data: vpc } = usePrefetchedApiQuery('vpcView', {
    path: { vpc: vpcSelector.vpc },
    query: { project: vpcSelector.project },
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>{vpc.name}</PageTitle>
        <VpcDocsPopover />
      </PageHeader>
      <PropertiesTable.Group className="mb-16 md-:mb-10">
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

      <RouteTabs fullWidth>
        <Tab to={pb.vpcFirewallRules(vpcSelector)}>Firewall Rules</Tab>
        <Tab to={pb.vpcSubnets(vpcSelector)}>Subnets</Tab>
      </RouteTabs>
    </>
  )
}
