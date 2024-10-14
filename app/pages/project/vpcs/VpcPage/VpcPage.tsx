/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
} from '@oxide/api'
import { Networking24Icon } from '@oxide/design-system/icons/react'

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

import { VpcDocsPopover } from '../VpcsPage'

VpcPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc } = getVpcSelector(params)
  await apiQueryClient.prefetchQuery('vpcView', { path: { vpc }, query: { project } })
  return null
}

export function VpcPage() {
  const queryClient = useApiQueryClient()
  const navigate = useNavigate()
  const vpcSelector = useVpcSelector()
  const { project, vpc: vpcName } = vpcSelector
  const { data: vpc } = usePrefetchedApiQuery('vpcView', {
    path: { vpc: vpcName },
    query: { project },
  })

  const { mutateAsync: deleteVpc } = useApiMutation('vpcDelete', {
    onSuccess(_data, variables) {
      queryClient.invalidateQueries('vpcList')
      navigate(pb.vpcs({ project }))
      addToast({ content: `${variables.path.vpc} deleted` })
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
