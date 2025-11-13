/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import { api, q, queryClient, useApiMutation, usePrefetchedQuery } from '@oxide/api'
import { Networking24Icon } from '@oxide/design-system/icons/react'

import { HL } from '~/components/HL'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { getVpcSelector, useVpcSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import * as DropdownMenu from '~/ui/lib/DropdownMenu'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import { VpcDocsPopover } from './VpcsPage'

const vpcView = ({ project, vpc }: PP.Vpc) =>
  q(api.vpcView, { path: { vpc }, query: { project } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  await queryClient.prefetchQuery(vpcView(getVpcSelector(params)))
  return null
}

export default function VpcPage() {
  const navigate = useNavigate()
  const vpcSelector = useVpcSelector()
  const { project, vpc: vpcName } = vpcSelector
  const { data: vpc } = usePrefetchedQuery(vpcView(vpcSelector))

  const { mutateAsync: deleteVpc } = useApiMutation(api.vpcDelete, {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('vpcList')
      navigate(pb.vpcs({ project }))
      addToast(<>VPC <HL>{variables.path.vpc}</HL> deleted</>) // prettier-ignore
    },
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>{vpc.name}</PageTitle>
        <div className="inline-flex gap-2">
          <VpcDocsPopover />
          <MoreActionsMenu label="VPC actions">
            <DropdownMenu.LinkItem to={pb.vpcEdit(vpcSelector)}>Edit</DropdownMenu.LinkItem>
            <DropdownMenu.Item
              label="Delete"
              onSelect={confirmDelete({
                doDelete: () => deleteVpc({ path: { vpc: vpcName }, query: { project } }),
                label: vpcName,
              })}
              className="destructive"
            />
          </MoreActionsMenu>
        </div>
      </PageHeader>
      <PropertiesTable columns={2} className="-mt-8 mb-8">
        <PropertiesTable.DescriptionRow description={vpc.description} />
        <PropertiesTable.Row label="DNS Name">{vpc.dnsName}</PropertiesTable.Row>
        <PropertiesTable.DateRow date={vpc.timeCreated} label="Created" />
        <PropertiesTable.DateRow date={vpc.timeModified} label="Last Modified" />
      </PropertiesTable>

      <RouteTabs fullWidth>
        <Tab to={pb.vpcFirewallRules(vpcSelector)}>Firewall Rules</Tab>
        <Tab to={pb.vpcSubnets(vpcSelector)}>Subnets</Tab>
        <Tab to={pb.vpcRouters(vpcSelector)}>Routers</Tab>
        <Tab to={pb.vpcInternetGateways(vpcSelector)}>Internet Gateways</Tab>
      </RouteTabs>
    </>
  )
}
