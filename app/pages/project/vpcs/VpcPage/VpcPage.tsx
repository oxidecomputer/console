/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import { apiq, queryClient, useApiMutation, usePrefetchedQuery } from '@oxide/api'
import { Networking24Icon } from '@oxide/design-system/icons/react'

import { HL } from '~/components/HL'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { getVpcSelector, useVpcSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { DateTime } from '~/ui/lib/DateTime'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import { VpcDocsPopover } from '../VpcsPage'

const vpcView = ({ project, vpc }: PP.Vpc) =>
  apiq('vpcView', { path: { vpc }, query: { project } })

VpcPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await queryClient.prefetchQuery(vpcView(getVpcSelector(params)))
  return null
}

export function VpcPage() {
  const navigate = useNavigate()
  const vpcSelector = useVpcSelector()
  const { project, vpc: vpcName } = vpcSelector
  const { data: vpc } = usePrefetchedQuery(vpcView(vpcSelector))

  const { mutateAsync: deleteVpc } = useApiMutation('vpcDelete', {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('vpcList')
      navigate(pb.vpcs({ project }))
      addToast(<>VPC <HL>{variables.path.vpc}</HL> deleted</>) // prettier-ignore
    },
  })

  const actions = useMemo(
    () => [
      {
        label: 'Edit',
        onActivate() {
          navigate(pb.vpcEdit(vpcSelector))
        },
      },
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () => deleteVpc({ path: { vpc: vpcName }, query: { project } }),
          label: vpcName,
        }),
        className: 'destructive',
      },
    ],
    [deleteVpc, navigate, project, vpcName, vpcSelector]
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>{vpc.name}</PageTitle>
        <div className="inline-flex gap-2">
          <VpcDocsPopover />
          <MoreActionsMenu label="VPC actions" actions={actions} />
        </div>
      </PageHeader>
      <PropertiesTable.Group className="mb-16">
        <PropertiesTable>
          <PropertiesTable.Row label="Description">
            <DescriptionCell text={vpc.description} />
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
        <Tab to={pb.vpcRouters(vpcSelector)}>Routers</Tab>
      </RouteTabs>
    </>
  )
}
