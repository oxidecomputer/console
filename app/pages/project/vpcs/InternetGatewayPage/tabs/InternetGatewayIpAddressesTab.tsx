/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient } from '~/api'
import { getInternetGatewaySelector, useInternetGatewaySelector } from '~/hooks/use-params'
import { ALL_ISH } from '~/util/consts'

InternetGatewayIpAddressesTab.loader = async function ({ params }: LoaderFunctionArgs) {
  const { project, vpc, gateway } = getInternetGatewaySelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('internetGatewayIpAddressList', {
      query: { project, vpc, gateway, limit: ALL_ISH },
    }),
  ])
  return null
}

export function InternetGatewayIpAddressesTab() {
  const gatewaySelector = useInternetGatewaySelector()
  const { project, vpc, gateway } = gatewaySelector
  // const query = { project, vpc, limit: ALL_ISH }
  console.log({ project, vpc, gateway })
  return <>IP Addresses stuff will go here</>
}
