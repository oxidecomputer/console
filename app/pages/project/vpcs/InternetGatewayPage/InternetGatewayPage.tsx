/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { type LoaderFunctionArgs } from 'react-router-dom'

import { Networking24Icon } from '@oxide/design-system/icons/react'

import { apiQueryClient, usePrefetchedApiQuery } from '~/api'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { getInternetGatewaySelector, useInternetGatewaySelector } from '~/hooks/use-params'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { ALL_ISH } from '~/util/consts'
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
  // const query = { project, vpc, limit: ALL_ISH }

  const { data: internetGateway } = usePrefetchedApiQuery('internetGatewayView', {
    query: { project, vpc },
    path: { gateway },
  })

  console.log(internetGateway)
  // const { Table: IpPoolsTable } = useQueryTable('internetGatewayIpPoolsList', {
  //   query,
  // })

  // const { Table: IpAddressesTable } = useQueryTable('internetGatewayIpAddressList', {
  //   query,
  // })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>{gateway}</PageTitle>
      </PageHeader>
      <RouteTabs fullWidth>
        <Tab to={pb.vpcInternetGatewayIpPools(gatewaySelector)}>IP Pools</Tab>
        <Tab to={pb.vpcInternetGatewayIpAddresses(gatewaySelector)}>IP Addresses</Tab>
      </RouteTabs>
    </>
  )
}
