/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { LoaderFunctionArgs } from 'react-router-dom'

import { Networking16Icon, Networking24Icon } from '@oxide/design-system/icons/react'

import { apiQueryClient, usePrefetchedApiQuery } from '~/api'
import { DocsPopover } from '~/components/DocsPopover'
import { getVpcRouterSelector, useVpcRouterSelector } from '~/hooks'
import { PAGE_SIZE } from '~/table/QueryTable'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { docLinks } from '~/util/links'

RouterRoutePage.loader = async function ({ params }: LoaderFunctionArgs) {
  const { project, vpc, router } = getVpcRouterSelector(params)
  console.log({ project, vpc, router })
  const query = { limit: PAGE_SIZE }
  await apiQueryClient.prefetchQuery('vpcRouterView', {
    path: { router },
    query: { project, vpc, ...query },
  })
  console.log({ params })
  return null
}

export function RouterRoutePage() {
  const query = { limit: PAGE_SIZE }
  const { project, vpc, router } = useVpcRouterSelector()
  const { data: routerData } = usePrefetchedApiQuery('vpcRouterView', {
    path: { router },
    query: { project, vpc, ...query },
  })
  console.log({ routerData })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>{router}</PageTitle>
        <DocsPopover
          heading="Routers"
          icon={<Networking16Icon />}
          summary="Routers summary copy TK"
          links={[docLinks.routers]}
        />
      </PageHeader>
      <p>More to come here, based on IP Pools page</p>
    </>
  )
}
