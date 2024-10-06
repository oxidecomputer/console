/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useMemo } from 'react'
import { type LoaderFunctionArgs } from 'react-router-dom'

import { Networking16Icon, Networking24Icon } from '@oxide/design-system/icons/react'

import { apiQueryClient, usePrefetchedApiQuery } from '~/api'
import { DocsPopover } from '~/components/DocsPopover'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { getInternetGatewaySelector, useInternetGatewaySelector } from '~/hooks/use-params'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { DateTime } from '~/ui/lib/DateTime'
import { Message } from '~/ui/lib/Message'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

InternetGatewayPage.loader = async function ({ params }: LoaderFunctionArgs) {
  console.log('InternetGatewayPage.loader')
  const { project, vpc, gateway } = getInternetGatewaySelector(params)
  console.log({ project, vpc, gateway })
  const query = { project, vpc, gateway, limit: ALL_ISH }
  await Promise.all([
    apiQueryClient.prefetchQuery('internetGatewayView', {
      query: { project, vpc },
      path: { gateway },
    }),
    apiQueryClient.prefetchQuery('internetGatewayIpAddressList', { query }),
    apiQueryClient.prefetchQuery('internetGatewayIpPoolList', { query }),
  ])
  return null
}

export function InternetGatewayPage() {
  const gatewaySelector = useInternetGatewaySelector()
  const { project, vpc, gateway } = gatewaySelector
  const {
    data: { id, description, name, timeCreated, timeModified },
  } = usePrefetchedApiQuery('internetGatewayView', {
    query: { project, vpc },
    path: { gateway },
  })

  const actions = useMemo(
    () => [
      {
        label: 'Copy ID',
        onActivate() {
          window.navigator.clipboard.writeText(id || '')
        },
      },
    ],
    [id]
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>{name}</PageTitle>
        <div className="inline-flex gap-2">
          <DocsPopover
            heading="Internet Gateways"
            icon={<Networking16Icon />}
            summary="Internet gateways … 🚨🙈🚨🙉🚨🙊🚨 … just using emojis here so we spot it more easily in the PR; this copy needs eyes 👀"
            links={[docLinks.vpcs, docLinks.firewallRules]}
          />
          <MoreActionsMenu label="VPC actions" actions={actions} />
        </div>
      </PageHeader>
      <PropertiesTable.Group className="mb-16">
        <PropertiesTable>
          <PropertiesTable.Row label="Description">
            <DescriptionCell text={description} />
          </PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="Created">
            <DateTime date={timeCreated} />
          </PropertiesTable.Row>
          <PropertiesTable.Row label="Last Modified">
            <DateTime date={timeModified} />
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>

      <Message
        variant="notice"
        className="mt-4"
        content={
          <>
            This is a read-only copy of this internet gateway. Use the CLI to create and
            update internet gateways. More functionality for internet gateways will be
            included in future releases of the Oxide console.
          </>
        }
      />

      <RouteTabs fullWidth>
        <Tab to={pb.vpcInternetGatewayIpPools(gatewaySelector)}>IP Pools</Tab>
        <Tab to={pb.vpcInternetGatewayIpAddresses(gatewaySelector)}>IP Addresses</Tab>
      </RouteTabs>
    </>
  )
}
